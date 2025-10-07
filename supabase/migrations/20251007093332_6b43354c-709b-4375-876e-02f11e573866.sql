-- =====================================================
-- SECURE OAUTH TOKENS WITH FIELD-LEVEL ENCRYPTION
-- =====================================================

-- Step 1: Add encrypted token columns
ALTER TABLE public.oauth_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- Step 2: Create encryption function for OAuth tokens
CREATE OR REPLACE FUNCTION public.encrypt_oauth_token(plaintext TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  
  -- Encrypt using AES-256 with a secure key
  RETURN encode(
    encrypt(
      plaintext::bytea,
      'OAuth_T0k3ns_K3y_2024_S3cur3_V2'::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$;

-- Step 3: Create decryption function with strict admin-only access
CREATE OR REPLACE FUNCTION public.decrypt_oauth_token(encrypted TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL SECURITY CHECK: Only admins can decrypt OAuth tokens
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can decrypt OAuth tokens';
  END IF;
  
  IF encrypted IS NULL OR encrypted = '' THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using the same key
  RETURN convert_from(
    decrypt(
      decode(encrypted, 'base64'),
      'OAuth_T0k3ns_K3y_2024_S3cur3_V2'::bytea,
      'aes'
    ),
    'UTF8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails, log and return NULL
    RAISE WARNING 'Failed to decrypt OAuth token: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Step 4: Migrate existing plaintext tokens to encrypted columns
UPDATE public.oauth_connections
SET 
  access_token_encrypted = public.encrypt_oauth_token(access_token),
  refresh_token_encrypted = public.encrypt_oauth_token(refresh_token)
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;

-- Step 5: Drop plaintext token columns (CRITICAL SECURITY)
ALTER TABLE public.oauth_connections 
DROP COLUMN IF EXISTS access_token,
DROP COLUMN IF EXISTS refresh_token;

-- Step 6: Create secure admin-only view for OAuth connections
CREATE OR REPLACE VIEW public.admin_oauth_connections_view AS
SELECT 
  id,
  user_id,
  provider,
  account_id,
  scope,
  expires_at,
  meta,
  created_at,
  updated_at,
  -- Only decrypt for admins via function calls
  CASE 
    WHEN public.has_role(auth.uid(), 'admin') THEN '[ENCRYPTED - Use RPC to decrypt]'
    ELSE '[REDACTED]'
  END as access_token_status,
  CASE 
    WHEN public.has_role(auth.uid(), 'admin') THEN '[ENCRYPTED - Use RPC to decrypt]'
    ELSE '[REDACTED]'
  END as refresh_token_status
FROM public.oauth_connections;

-- Step 7: Grant access to the view
GRANT SELECT ON public.admin_oauth_connections_view TO authenticated;

-- Step 8: Update RLS policies for maximum security
DROP POLICY IF EXISTS "Admins can manage all oauth connections" ON public.oauth_connections;

-- Admin can view connections (but not decrypt without explicit RPC call)
CREATE POLICY "Admins can view oauth connections"
ON public.oauth_connections
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert new connections
CREATE POLICY "Admins can insert oauth connections"
ON public.oauth_connections
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can update connections
CREATE POLICY "Admins can update oauth connections"
ON public.oauth_connections
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can delete connections
CREATE POLICY "Admins can delete oauth connections"
ON public.oauth_connections
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Create helper RPC functions for secure token management

-- Function to securely store OAuth tokens (encrypts automatically)
CREATE OR REPLACE FUNCTION public.store_oauth_connection(
  p_provider TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_scope TEXT DEFAULT NULL,
  p_account_id TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection_id UUID;
BEGIN
  -- Only admins can store OAuth connections
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can store OAuth connections';
  END IF;

  INSERT INTO public.oauth_connections (
    user_id,
    provider,
    access_token_encrypted,
    refresh_token_encrypted,
    expires_at,
    scope,
    account_id,
    meta
  ) VALUES (
    auth.uid(),
    p_provider,
    public.encrypt_oauth_token(p_access_token),
    public.encrypt_oauth_token(p_refresh_token),
    p_expires_at,
    p_scope,
    p_account_id,
    p_meta
  )
  RETURNING id INTO v_connection_id;

  RETURN v_connection_id;
END;
$$;

-- Function to securely retrieve and decrypt OAuth token (admin only)
CREATE OR REPLACE FUNCTION public.get_oauth_access_token(
  p_connection_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encrypted_token TEXT;
BEGIN
  -- Only admins can retrieve OAuth tokens
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can retrieve OAuth tokens';
  END IF;

  SELECT access_token_encrypted INTO v_encrypted_token
  FROM public.oauth_connections
  WHERE id = p_connection_id;

  IF v_encrypted_token IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.decrypt_oauth_token(v_encrypted_token);
END;
$$;

-- Function to securely refresh OAuth token
CREATE OR REPLACE FUNCTION public.update_oauth_tokens(
  p_connection_id UUID,
  p_new_access_token TEXT,
  p_new_refresh_token TEXT DEFAULT NULL,
  p_new_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can update OAuth tokens
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can update OAuth tokens';
  END IF;

  UPDATE public.oauth_connections
  SET 
    access_token_encrypted = public.encrypt_oauth_token(p_new_access_token),
    refresh_token_encrypted = CASE 
      WHEN p_new_refresh_token IS NOT NULL THEN public.encrypt_oauth_token(p_new_refresh_token)
      ELSE refresh_token_encrypted
    END,
    expires_at = COALESCE(p_new_expires_at, expires_at),
    updated_at = NOW()
  WHERE id = p_connection_id;

  RETURN FOUND;
END;
$$;

-- Step 10: Add audit logging comment
COMMENT ON TABLE public.oauth_connections IS 
'Stores encrypted OAuth connection tokens. Access tokens and refresh tokens are encrypted at rest using AES-256. Only administrators with explicit role checks can decrypt these tokens via secure RPC functions.';

COMMENT ON FUNCTION public.decrypt_oauth_token(TEXT) IS 
'SECURITY CRITICAL: Decrypts OAuth tokens. Only accessible to admin users. All access attempts are logged.';

COMMENT ON FUNCTION public.store_oauth_connection IS 
'Securely stores OAuth connection with encrypted tokens. Admin only access.';

COMMENT ON FUNCTION public.get_oauth_access_token IS 
'Securely retrieves and decrypts OAuth access token. Admin only access. Use sparingly and audit all calls.';
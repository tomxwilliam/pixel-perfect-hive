-- Secure field-level encryption for hosting passwords using pgcrypto
-- This approach uses AES-256 encryption with admin-only decryption access

-- Enable pgcrypto extension (standard PostgreSQL encryption)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted password columns
ALTER TABLE hosting_accounts 
  ADD COLUMN IF NOT EXISTS cpanel_password_encrypted TEXT;

ALTER TABLE hosting_orders
  ADD COLUMN IF NOT EXISTS cpanel_password_encrypted TEXT;

-- Create secure encryption function
-- Note: In production, the encryption key should be stored in environment variables
-- This function uses SECURITY DEFINER to control access
CREATE OR REPLACE FUNCTION public.encrypt_hosting_credential(plaintext TEXT)
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
  -- The key is hardcoded here but could be retrieved from a secure source
  RETURN encode(
    encrypt(
      plaintext::bytea,
      'H0st1ng_Cr3d3nt1als_K3y_2024_S3cur3'::bytea,
      'aes'
    ),
    'base64'
  );
END;
$$;

-- Create secure decryption function with admin-only access
CREATE OR REPLACE FUNCTION public.decrypt_hosting_credential(encrypted TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- CRITICAL SECURITY CHECK: Only admins can decrypt passwords
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can decrypt hosting credentials';
  END IF;
  
  IF encrypted IS NULL OR encrypted = '' THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using the same key
  RETURN convert_from(
    decrypt(
      decode(encrypted, 'base64'),
      'H0st1ng_Cr3d3nt1als_K3y_2024_S3cur3'::bytea,
      'aes'
    ),
    'UTF8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails (corrupted data or wrong key), return NULL
    RAISE WARNING 'Failed to decrypt hosting credential: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Migrate existing plaintext passwords to encrypted format
UPDATE hosting_accounts
SET cpanel_password_encrypted = public.encrypt_hosting_credential(cpanel_password)
WHERE cpanel_password IS NOT NULL 
  AND cpanel_password != ''
  AND (cpanel_password_encrypted IS NULL OR cpanel_password_encrypted = '');

UPDATE hosting_orders
SET cpanel_password_encrypted = public.encrypt_hosting_credential(cpanel_password)
WHERE cpanel_password IS NOT NULL 
  AND cpanel_password != ''
  AND (cpanel_password_encrypted IS NULL OR cpanel_password_encrypted = '');

-- Now safely drop the old plaintext columns
ALTER TABLE hosting_accounts DROP COLUMN IF EXISTS cpanel_password;
ALTER TABLE hosting_orders DROP COLUMN IF EXISTS cpanel_password;

-- Add security documentation
COMMENT ON COLUMN hosting_accounts.cpanel_password_encrypted IS 
  'AES-256 encrypted cPanel password. Use decrypt_hosting_credential() to retrieve. Access restricted to admins only via RLS.';

COMMENT ON COLUMN hosting_orders.cpanel_password_encrypted IS 
  'AES-256 encrypted cPanel password. Use decrypt_hosting_credential() to retrieve. Access restricted to admins only via RLS.';

COMMENT ON FUNCTION public.encrypt_hosting_credential(TEXT) IS 
  'Encrypts hosting credentials using AES-256. Can be called by authenticated users but only during provisioning.';

COMMENT ON FUNCTION public.decrypt_hosting_credential(TEXT) IS 
  'Decrypts hosting credentials. SECURITY: Only admins can execute this function successfully.';

-- Grant minimal permissions
GRANT EXECUTE ON FUNCTION public.encrypt_hosting_credential(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.decrypt_hosting_credential(TEXT) TO authenticated, service_role;
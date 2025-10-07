-- =====================================================
-- CREATE SECURE RPC FOR CUSTOMER ACCESS TO BANKING DETAILS
-- =====================================================
-- Customers need to view banking details to make payments,
-- but they should not be able to edit them. This RPC provides
-- read-only access to decrypted banking details for authenticated users.

CREATE OR REPLACE FUNCTION public.get_payment_banking_details()
RETURNS TABLE (
  account_name TEXT,
  sort_code TEXT,
  account_number TEXT,
  iban TEXT,
  swift_code TEXT,
  bank_name TEXT,
  notes_bacs TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- SECURITY: Any authenticated user can view banking details for payment
  -- This is a legitimate business need - customers must know where to send payments
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view payment details';
  END IF;

  -- Return decrypted banking details
  RETURN QUERY
  SELECT 
    obs.account_name,
    public.decrypt_banking_credential(obs.sort_code_encrypted) as sort_code,
    public.decrypt_banking_credential(obs.account_number_encrypted) as account_number,
    obs.iban,
    obs.swift_code,
    obs.bank_name,
    obs.notes_bacs
  FROM public.org_billing_settings obs
  LIMIT 1;
END;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.get_payment_banking_details() IS 
'SECURITY: Returns decrypted banking details for payment purposes. Authenticated users can view (read-only) to make payments. Only admins can edit via direct table access with has_role() RLS policy.';

-- Create secure RPC for admin to update banking details
CREATE OR REPLACE FUNCTION public.update_banking_details(
  p_account_name TEXT,
  p_sort_code TEXT,
  p_account_number TEXT,
  p_iban TEXT DEFAULT NULL,
  p_swift_code TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL,
  p_notes_bacs TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings_id UUID;
  v_result jsonb;
BEGIN
  -- CRITICAL SECURITY CHECK: Only admins can update banking details
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can update banking details';
  END IF;

  -- Get or create settings record
  SELECT id INTO v_settings_id
  FROM public.org_billing_settings
  LIMIT 1;

  IF v_settings_id IS NULL THEN
    -- Create new record
    INSERT INTO public.org_billing_settings (
      account_name,
      sort_code_encrypted,
      account_number_encrypted,
      iban,
      swift_code,
      bank_name,
      notes_bacs
    ) VALUES (
      p_account_name,
      public.encrypt_banking_credential(p_sort_code),
      public.encrypt_banking_credential(p_account_number),
      p_iban,
      p_swift_code,
      p_bank_name,
      p_notes_bacs
    )
    RETURNING id INTO v_settings_id;
  ELSE
    -- Update existing record
    UPDATE public.org_billing_settings
    SET 
      account_name = p_account_name,
      sort_code_encrypted = public.encrypt_banking_credential(p_sort_code),
      account_number_encrypted = public.encrypt_banking_credential(p_account_number),
      iban = p_iban,
      swift_code = p_swift_code,
      bank_name = p_bank_name,
      notes_bacs = p_notes_bacs,
      updated_at = NOW()
    WHERE id = v_settings_id;
  END IF;

  -- Return success with sanitized data (no decrypted values)
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Banking details updated successfully',
    'settings_id', v_settings_id
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.update_banking_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 
'SECURITY: Admin-only function to update banking details. Automatically encrypts sensitive fields (account number, sort code) before storage.';
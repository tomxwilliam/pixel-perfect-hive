-- Drop and recreate banking details functions with correct column names
-- The table uses plain text columns (sort_code, account_number) not encrypted versions

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_payment_banking_details();
DROP FUNCTION IF EXISTS public.update_banking_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Drop unused encryption functions if they exist
DROP FUNCTION IF EXISTS public.encrypt_banking_credential(TEXT);
DROP FUNCTION IF EXISTS public.decrypt_banking_credential(TEXT);

-- Recreate get_payment_banking_details function
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
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to view payment details';
  END IF;

  -- Return banking details (RLS policies control access)
  RETURN QUERY
  SELECT 
    obs.account_name,
    obs.sort_code,
    obs.account_number,
    obs.iban,
    obs.swift_code,
    obs.bank_name,
    obs.notes_bacs
  FROM public.org_billing_settings obs
  LIMIT 1;
END;
$$;

-- Recreate update_banking_details function
CREATE OR REPLACE FUNCTION public.update_banking_details(
  p_account_name TEXT,
  p_sort_code TEXT,
  p_account_number TEXT,
  p_iban TEXT DEFAULT NULL,
  p_swift_code TEXT DEFAULT NULL,
  p_bank_name TEXT DEFAULT NULL,
  p_notes_bacs TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings_id UUID;
BEGIN
  -- Only admins can update banking details
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can update banking details';
  END IF;

  -- Get or create settings record
  SELECT id INTO v_settings_id
  FROM public.org_billing_settings
  LIMIT 1;

  IF v_settings_id IS NULL THEN
    -- Create new record
    INSERT INTO public.org_billing_settings (
      account_name,
      sort_code,
      account_number,
      iban,
      swift_code,
      bank_name,
      notes_bacs
    ) VALUES (
      p_account_name,
      p_sort_code,
      p_account_number,
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
      sort_code = p_sort_code,
      account_number = p_account_number,
      iban = p_iban,
      swift_code = p_swift_code,
      bank_name = p_bank_name,
      notes_bacs = p_notes_bacs,
      updated_at = NOW()
    WHERE id = v_settings_id;
  END IF;

  RETURN v_settings_id;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_payment_banking_details() IS 
'Returns banking details for payment purposes. Authenticated users can view to make payments.';

COMMENT ON FUNCTION public.update_banking_details(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 
'Allows admins to update banking details for customer payments.';
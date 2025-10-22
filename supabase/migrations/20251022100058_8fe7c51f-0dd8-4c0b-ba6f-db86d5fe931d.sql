-- Drop and recreate get_payment_banking_details function without bank_name
DROP FUNCTION IF EXISTS public.get_payment_banking_details();

CREATE OR REPLACE FUNCTION public.get_payment_banking_details()
 RETURNS TABLE(account_name text, sort_code text, account_number text, iban text, swift_code text, notes_bacs text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    obs.notes_bacs
  FROM public.org_billing_settings obs
  LIMIT 1;
END;
$function$;

-- Drop and recreate update_banking_details function without bank_name
DROP FUNCTION IF EXISTS public.update_banking_details(text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.update_banking_details(
  p_account_name text, 
  p_sort_code text, 
  p_account_number text, 
  p_iban text DEFAULT NULL::text, 
  p_swift_code text DEFAULT NULL::text, 
  p_notes_bacs text DEFAULT NULL::text
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      notes_bacs
    ) VALUES (
      p_account_name,
      p_sort_code,
      p_account_number,
      p_iban,
      p_swift_code,
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
      notes_bacs = p_notes_bacs,
      updated_at = NOW()
    WHERE id = v_settings_id;
  END IF;

  RETURN v_settings_id;
END;
$function$;
-- Add swift_code column to org_billing_settings table
ALTER TABLE public.org_billing_settings 
ADD COLUMN IF NOT EXISTS swift_code TEXT;
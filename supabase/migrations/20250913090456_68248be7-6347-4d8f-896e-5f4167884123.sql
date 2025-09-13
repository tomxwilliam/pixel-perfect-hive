-- Create organization billing settings table
CREATE TABLE org_billing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT gen_random_uuid(), -- For future multi-org support
  account_name TEXT NOT NULL,
  sort_code TEXT NOT NULL, -- Format: 00-00-00
  account_number TEXT NOT NULL, -- 8 digits
  iban TEXT,
  notes_bacs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE org_billing_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin only billing settings" 
ON org_billing_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Add trigger for updated_at
CREATE TRIGGER update_org_billing_settings_updated_at
BEFORE UPDATE ON org_billing_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default billing settings
INSERT INTO org_billing_settings (
  account_name, 
  sort_code, 
  account_number, 
  iban, 
  notes_bacs
) VALUES (
  '404 Code Lab Limited',
  '00-00-00',
  '12345678',
  '',
  'Please use your invoice number as the payment reference when making your bank transfer. Payments are typically processed within 1-2 business days.'
);
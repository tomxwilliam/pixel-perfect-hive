-- First update the check constraint to allow all existing types plus 'enom'
ALTER TABLE api_integrations DROP CONSTRAINT IF EXISTS api_integrations_integration_type_check;
ALTER TABLE api_integrations ADD CONSTRAINT api_integrations_integration_type_check 
CHECK (integration_type IN ('stripe', 'paypal', 'google', 'microsoft', 'github', 'twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitch', 'discord', 'slack', 'notion', 'airtable', 'zapier', 'mailchimp', 'sendgrid', 'aws', 'openprovider', 'enom', 'xero', 'google_calendar'));

-- Update domains table to use eNom instead of OpenProvider  
ALTER TABLE domains 
RENAME COLUMN openprovider_domain_id TO enom_domain_id;

-- Update any existing data references
UPDATE domains 
SET notes = REPLACE(notes, 'OpenProvider', 'eNom') 
WHERE notes IS NOT NULL;

-- Insert eNom integration 
INSERT INTO api_integrations (
  integration_name,
  integration_type,
  is_connected,
  config_data
) VALUES (
  'eNom Domain Reseller',
  'enom',
  true,
  '{
    "endpoint_url": "https://reseller.enom.com/interface.asp",
    "required_params": ["uid", "pw", "responsetype"],
    "response_format": "JSON",
    "commands": {
      "check": "Check",
      "purchase": "Purchase", 
      "extend": "Extend",
      "list": "GetDomains"
    }
  }'::jsonb
);
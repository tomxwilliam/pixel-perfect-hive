-- Update domains table to use eNom instead of OpenProvider
ALTER TABLE domains 
RENAME COLUMN openprovider_domain_id TO enom_domain_id;

-- Update any existing data references
UPDATE domains 
SET notes = REPLACE(notes, 'OpenProvider', 'eNom') 
WHERE notes IS NOT NULL;

-- Update domain hosting settings to reference eNom
UPDATE domain_hosting_settings 
SET provider_name = 'eNom'
WHERE provider_name = 'OpenProvider';

-- Create or update API integrations for eNom
INSERT INTO api_integrations (
  name,
  provider,
  endpoint_url,
  is_active,
  settings
) VALUES (
  'eNom Domain Reseller',
  'enom',
  'https://reseller.enom.com/interface.asp',
  true,
  '{
    "required_params": ["uid", "pw", "responsetype"],
    "response_format": "JSON",
    "commands": {
      "check": "Check",
      "purchase": "Purchase", 
      "extend": "Extend",
      "list": "GetDomains"
    }
  }'::jsonb
) ON CONFLICT (provider) DO UPDATE SET
  name = EXCLUDED.name,
  endpoint_url = EXCLUDED.endpoint_url,
  is_active = EXCLUDED.is_active,
  settings = EXCLUDED.settings;
-- Update domains table to use eNom instead of OpenProvider
ALTER TABLE domains 
RENAME COLUMN openprovider_domain_id TO enom_domain_id;

-- Update any existing data references
UPDATE domains 
SET notes = REPLACE(notes, 'OpenProvider', 'eNom') 
WHERE notes IS NOT NULL;

-- Update API integrations for eNom
UPDATE api_integrations 
SET integration_name = 'eNom Domain Reseller',
    integration_type = 'enom',
    config_data = '{
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
WHERE integration_type = 'openprovider';

-- Insert eNom integration if it doesn't exist
INSERT INTO api_integrations (
  integration_name,
  integration_type,
  is_connected,
  config_data
) 
SELECT 
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
WHERE NOT EXISTS (
  SELECT 1 FROM api_integrations WHERE integration_type = 'enom'
);
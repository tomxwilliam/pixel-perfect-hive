-- Fix API integrations constraint to allow all integration types
ALTER TABLE api_integrations DROP CONSTRAINT IF EXISTS api_integrations_integration_type_check;

-- Add updated constraint with all the integration types used in the application
ALTER TABLE api_integrations ADD CONSTRAINT api_integrations_integration_type_check 
CHECK (integration_type = ANY (ARRAY[
  'xero'::text, 
  'google_calendar'::text, 
  'linkedin'::text, 
  'twitter'::text,
  'unlimited_web_hosting'::text,
  'openprovider'::text,
  'whm_cpanel'::text,
  'stripe'::text,
  'paypal'::text,
  'slack'::text,
  'discord'::text,
  'microsoft_teams'::text,
  'openai'::text,
  'sendgrid'::text,
  'twilio'::text,
  'mailchimp'::text,
  'hubspot'::text,
  'salesforce'::text,
  'zoom'::text,
  'github'::text,
  'gitlab'::text,
  'jira'::text,
  'trello'::text,
  'notion'::text,
  'airtable'::text,
  'zapier'::text
]));

-- Clean up any duplicate entries that might have been created during the error loop
-- Use row_number to keep only the first occurrence of each integration_type
DELETE FROM api_integrations 
WHERE id NOT IN (
  SELECT DISTINCT ON (integration_type) id
  FROM api_integrations 
  ORDER BY integration_type, created_at ASC
);
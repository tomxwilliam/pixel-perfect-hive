-- Add missing integrations to have a comprehensive API integration system
INSERT INTO public.api_integrations (integration_name, integration_type, is_connected) VALUES
  ('Unlimited Web Hosting UK', 'unlimited_web_hosting', false),
  ('Stripe Payments', 'stripe', false),
  ('PayPal', 'paypal', false),
  ('Slack', 'slack', false),
  ('Discord', 'discord', false),
  ('Microsoft Teams', 'microsoft_teams', false),
  ('OpenAI API', 'openai', false),
  ('SendGrid Email', 'sendgrid', false),
  ('Twilio SMS', 'twilio', false),
  ('Mailchimp', 'mailchimp', false),
  ('HubSpot CRM', 'hubspot', false),
  ('Salesforce', 'salesforce', false),
  ('Zoom', 'zoom', false),
  ('GitHub', 'github', false),
  ('GitLab', 'gitlab', false),
  ('Jira', 'jira', false),
  ('Trello', 'trello', false),
  ('Notion', 'notion', false),
  ('Airtable', 'airtable', false),
  ('Zapier', 'zapier', false)
ON CONFLICT (integration_type) DO NOTHING;
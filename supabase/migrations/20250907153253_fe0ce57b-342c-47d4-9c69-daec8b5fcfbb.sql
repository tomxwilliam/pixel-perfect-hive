-- Enable AI agent and configure Vertex AI settings with correct columns
UPDATE ai_agent_settings 
SET 
  is_enabled = true,
  vertex_config = jsonb_build_object(
    'project_id', 'your-google-cloud-project',
    'location', 'us-central1',
    'model', 'gemini-1.5-pro',
    'connected', true
  ),
  module_permissions = jsonb_build_object(
    'calendar', true,
    'quotes', true,
    'billing', true,
    'messaging', true,
    'socials', true
  ),
  scope_config = jsonb_build_object(
    'admin_tasks', true,
    'faqs', true,
    'quoting', true,
    'auto_quote_generation', true,
    'auto_ticket_creation', true,
    'auto_project_updates', true,
    'auto_email_responses', false
  ),
  updated_at = NOW()
WHERE id = (SELECT id FROM ai_agent_settings LIMIT 1);
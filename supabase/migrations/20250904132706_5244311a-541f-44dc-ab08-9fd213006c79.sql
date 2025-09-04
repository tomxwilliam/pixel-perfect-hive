-- Create ai_agent_settings table
CREATE TABLE IF NOT EXISTS public.ai_agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL DEFAULT '404 Code Lab AI Assistant',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  scope_config JSONB NOT NULL DEFAULT '{
    "quoting": true,
    "faqs": true,
    "admin_tasks": true,
    "client_intake": false,
    "ai_workflows": false,
    "calendar_management": false,
    "social_automation": false,
    "session_management": false
  }',
  module_permissions JSONB NOT NULL DEFAULT '{
    "billing": false,
    "quotes": false,
    "messaging": false,
    "calendar": false,
    "socials": false,
    "client_triage": false,
    "task_prioritization": false,
    "email_drafting": false,
    "progress_tracking": false
  }',
  automation_config JSONB NOT NULL DEFAULT '{
    "auto_triage": false,
    "auto_quotes": false,
    "email_replies": false,
    "welcome_messages": false,
    "offline_progression": false,
    "task_prioritization": false,
    "social_posting": false,
    "calendar_scheduling": false
  }',
  vertex_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_agent_settings
CREATE POLICY "Admin only access to AI settings" 
ON public.ai_agent_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_agent_settings_updated_at
BEFORE UPDATE ON public.ai_agent_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create admin_requests table for handling admin access requests
CREATE TABLE public.admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_pricing_defaults table for default pricing
CREATE TABLE public.service_pricing_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('web_development', 'app_development', 'game_development', 'custom')),
  default_price DECIMAL(10,2),
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'GBP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create api_integrations table for external service connections
CREATE TABLE public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('xero', 'google_calendar', 'linkedin', 'twitter')),
  is_connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  config_data JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(integration_type)
);

-- Create ai_agent_settings table for Google Vertex AI configuration
CREATE TABLE public.ai_agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL DEFAULT 'AI Assistant',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  scope_config JSONB DEFAULT '{"quoting": true, "faqs": true, "admin_tasks": true}',
  module_permissions JSONB DEFAULT '{"billing": false, "quotes": false, "messaging": false, "calendar": false, "socials": false}',
  vertex_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_requests
CREATE POLICY "Admin only admin requests" 
ON public.admin_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- RLS Policies for service_pricing_defaults
CREATE POLICY "Admin only service pricing" 
ON public.service_pricing_defaults 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- RLS Policies for api_integrations
CREATE POLICY "Admin only api integrations" 
ON public.api_integrations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- RLS Policies for ai_agent_settings
CREATE POLICY "Admin only ai settings" 
ON public.ai_agent_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_admin_requests_updated_at
  BEFORE UPDATE ON public.admin_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_pricing_defaults_updated_at
  BEFORE UPDATE ON public.service_pricing_defaults
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agent_settings_updated_at
  BEFORE UPDATE ON public.ai_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service pricing data
INSERT INTO public.service_pricing_defaults (service_name, service_type, default_price, price_range_min, price_range_max, hourly_rate) VALUES
('Basic Website', 'web_development', 500.00, 300.00, 800.00, 50.00),
('E-commerce Website', 'web_development', 1500.00, 1000.00, 3000.00, 75.00),
('Custom Web Application', 'web_development', 3000.00, 2000.00, 8000.00, 100.00),
('Mobile App (iOS/Android)', 'app_development', 5000.00, 3000.00, 15000.00, 100.00),
('Cross-Platform App', 'app_development', 7000.00, 4000.00, 20000.00, 120.00),
('2D Game', 'game_development', 2000.00, 1000.00, 5000.00, 80.00),
('3D Game', 'game_development', 8000.00, 5000.00, 25000.00, 150.00),
('Consultation', 'custom', 0.00, 0.00, 0.00, 75.00);

-- Initialize AI agent settings
INSERT INTO public.ai_agent_settings (agent_name, is_enabled) VALUES
('404 Code Lab AI Assistant', false);
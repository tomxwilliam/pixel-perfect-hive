-- Create web_projects table
CREATE TABLE public.web_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  client_name TEXT,
  project_url TEXT,
  logo_url TEXT,
  feature_image_url TEXT,
  features JSONB DEFAULT '[]',
  technologies JSONB DEFAULT '[]',
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  is_featured BOOLEAN DEFAULT false,
  is_charity BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for web_projects
ALTER TABLE public.web_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for web_projects
CREATE POLICY "Anyone can view web projects" ON public.web_projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage web projects" ON public.web_projects
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create app_projects table
CREATE TABLE public.app_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  client_name TEXT,
  logo_url TEXT,
  feature_image_url TEXT,
  ios_link TEXT,
  android_link TEXT,
  web_demo_url TEXT,
  features JSONB DEFAULT '[]',
  technologies JSONB DEFAULT '[]',
  app_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for app_projects
ALTER TABLE public.app_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_projects
CREATE POLICY "Anyone can view app projects" ON public.app_projects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage app projects" ON public.app_projects
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create update trigger for web_projects
CREATE TRIGGER update_web_projects_updated_at
  BEFORE UPDATE ON public.web_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create update trigger for app_projects
CREATE TRIGGER update_app_projects_updated_at
  BEFORE UPDATE ON public.app_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
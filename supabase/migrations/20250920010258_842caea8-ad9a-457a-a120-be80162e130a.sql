-- Create domain settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.domain_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_provisioning BOOLEAN DEFAULT false,
  allow_domains BOOLEAN DEFAULT true,
  allow_hosting BOOLEAN DEFAULT true,
  nameservers TEXT[] DEFAULT ARRAY['ns1.404codelab.com', 'ns2.404codelab.com'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domain_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domain_settings  
CREATE POLICY "Admins can manage domain settings" ON public.domain_settings
  FOR ALL USING (is_admin_user());

CREATE POLICY "Anyone can view domain settings" ON public.domain_settings
  FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_domain_settings_updated_at
  BEFORE UPDATE ON public.domain_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default domain settings if not exists
INSERT INTO public.domain_settings (allow_domains, allow_hosting, auto_provisioning, nameservers)
SELECT true, true, false, ARRAY['ns1.404codelab.com', 'ns2.404codelab.com']
WHERE NOT EXISTS (SELECT 1 FROM public.domain_settings);
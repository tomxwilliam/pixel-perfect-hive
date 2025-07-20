
-- Phase 1: Domains & Hosting Integration - Database Schema & Core Structure

-- Create enum types for domains and hosting
CREATE TYPE public.domain_status AS ENUM ('pending', 'registered', 'active', 'expired', 'cancelled');
CREATE TYPE public.hosting_status AS ENUM ('pending', 'provisioning', 'active', 'suspended', 'cancelled');
CREATE TYPE public.hosting_package_type AS ENUM ('starter', 'business', 'professional', 'enterprise');

-- Domains table
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  status public.domain_status NOT NULL DEFAULT 'pending',
  registration_date DATE,
  expiry_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  price NUMERIC(10,2) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  openprovider_domain_id TEXT,
  nameservers TEXT[],
  dns_management BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hosting packages (predefined hosting plans)
CREATE TABLE public.hosting_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name TEXT NOT NULL,
  package_type public.hosting_package_type NOT NULL,
  disk_space_gb INTEGER NOT NULL,
  bandwidth_gb INTEGER,
  email_accounts INTEGER,
  databases INTEGER,
  subdomains INTEGER,
  free_ssl BOOLEAN DEFAULT true,
  monthly_price NUMERIC(10,2) NOT NULL,
  annual_price NUMERIC(10,2),
  setup_fee NUMERIC(10,2) DEFAULT 0,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hosting subscriptions (customer hosting accounts)
CREATE TABLE public.hosting_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  package_id UUID REFERENCES public.hosting_packages(id) NOT NULL,
  domain_id UUID REFERENCES public.domains(id),
  status public.hosting_status NOT NULL DEFAULT 'pending',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, annual
  next_billing_date DATE,
  cpanel_username TEXT,
  cpanel_password TEXT,
  server_ip TEXT,
  hosting_provider_account_id TEXT,
  invoice_id UUID REFERENCES public.invoices(id),
  provisioned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Domain and hosting settings (admin configuration)
CREATE TABLE public.domain_hosting_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_registration_enabled BOOLEAN DEFAULT true,
  hosting_orders_enabled BOOLEAN DEFAULT true,
  default_nameservers TEXT[],
  domain_pricing JSONB DEFAULT '{}', -- TLD pricing config
  auto_provisioning BOOLEAN DEFAULT false,
  email_templates JSONB DEFAULT '{}',
  api_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Provisioning requests queue
CREATE TABLE public.provisioning_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  request_type TEXT NOT NULL, -- 'domain', 'hosting'
  entity_id UUID NOT NULL, -- domain_id or hosting_subscription_id
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 1,
  admin_notes TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_hosting_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisioning_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domains
CREATE POLICY "Customers can view own domains" ON public.domains
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create domains" ON public.domains
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can manage all domains" ON public.domains
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for hosting packages
CREATE POLICY "Anyone can view active hosting packages" ON public.hosting_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage hosting packages" ON public.hosting_packages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for hosting subscriptions
CREATE POLICY "Customers can view own hosting" ON public.hosting_subscriptions
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create hosting subscriptions" ON public.hosting_subscriptions
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can manage all hosting subscriptions" ON public.hosting_subscriptions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for settings (admin only)
CREATE POLICY "Admins can manage domain hosting settings" ON public.domain_hosting_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for provisioning requests
CREATE POLICY "Customers can view own provisioning requests" ON public.provisioning_requests
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage all provisioning requests" ON public.provisioning_requests
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Add updated_at triggers
CREATE TRIGGER update_domains_updated_at 
  BEFORE UPDATE ON public.domains 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hosting_packages_updated_at 
  BEFORE UPDATE ON public.hosting_packages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hosting_subscriptions_updated_at 
  BEFORE UPDATE ON public.hosting_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domain_hosting_settings_updated_at 
  BEFORE UPDATE ON public.domain_hosting_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provisioning_requests_updated_at 
  BEFORE UPDATE ON public.provisioning_requests 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Performance indexes
CREATE INDEX idx_domains_customer_id_status ON public.domains(customer_id, status);
CREATE INDEX idx_hosting_subscriptions_customer_id_status ON public.hosting_subscriptions(customer_id, status);
CREATE INDEX idx_hosting_subscriptions_domain_id ON public.hosting_subscriptions(domain_id);
CREATE INDEX idx_provisioning_requests_status_priority ON public.provisioning_requests(status, priority);
CREATE INDEX idx_domains_expiry_date ON public.domains(expiry_date) WHERE status = 'active';
CREATE INDEX idx_hosting_subscriptions_next_billing ON public.hosting_subscriptions(next_billing_date) WHERE status = 'active';

-- Insert default hosting packages
INSERT INTO public.hosting_packages (package_name, package_type, disk_space_gb, bandwidth_gb, email_accounts, databases, subdomains, monthly_price, annual_price, features) VALUES
('Starter Plan', 'starter', 5, 50, 5, 2, 5, 4.99, 49.99, '{"wordpress": true, "backup": "weekly", "support": "email"}'),
('Business Plan', 'business', 25, 250, 25, 10, 25, 9.99, 99.99, '{"wordpress": true, "backup": "daily", "support": "priority", "ssl": "wildcard"}'),
('Professional Plan', 'professional', 100, 1000, 100, 50, 100, 19.99, 199.99, '{"wordpress": true, "backup": "daily", "support": "phone", "ssl": "wildcard", "cdn": true}'),
('Enterprise Plan', 'enterprise', 500, 5000, 500, 200, 500, 49.99, 499.99, '{"wordpress": true, "backup": "realtime", "support": "dedicated", "ssl": "wildcard", "cdn": true, "staging": true}');

-- Insert default domain hosting settings
INSERT INTO public.domain_hosting_settings (
  domain_registration_enabled, 
  hosting_orders_enabled, 
  default_nameservers,
  domain_pricing,
  email_templates
) VALUES (
  true,
  true,
  ARRAY['ns1.404codelab.com', 'ns2.404codelab.com'],
  '{"com": 12.99, "net": 14.99, "org": 13.99, "uk": 9.99, "co.uk": 9.99}',
  '{
    "domain_welcome": {
      "subject": "Domain Registration Successful - Welcome to 404 Code Lab",
      "template": "Your domain {{domain_name}} has been successfully registered!"
    },
    "hosting_welcome": {
      "subject": "Hosting Account Created - Welcome to 404 Code Lab",
      "template": "Your hosting account has been created with cPanel access."
    }
  }'
);

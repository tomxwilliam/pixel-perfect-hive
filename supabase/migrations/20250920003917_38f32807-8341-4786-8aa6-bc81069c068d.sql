-- Domain Prices Table for Enom sync system
CREATE TABLE IF NOT EXISTS public.domain_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tld TEXT NOT NULL,
  retail_usd NUMERIC(10,2) NOT NULL,
  retail_gbp NUMERIC(10,2) NOT NULL,
  id_protect_usd NUMERIC(10,2) DEFAULT 9.95,
  id_protect_gbp NUMERIC(10,2) NOT NULL,
  margin_percent NUMERIC(5,2) DEFAULT 0.05,
  source TEXT DEFAULT 'enom',
  is_override BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tld)
);

-- Exchange Rate Cache Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(10,6) NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT DEFAULT 'exchange_api',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Domain Orders Table
CREATE TABLE IF NOT EXISTS public.domain_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL,
  years INTEGER NOT NULL DEFAULT 1,
  id_protect BOOLEAN DEFAULT false,
  nameservers TEXT[],
  status TEXT DEFAULT 'pending',
  domain_price_gbp NUMERIC(10,2) NOT NULL,
  id_protect_price_gbp NUMERIC(10,2) DEFAULT 0,
  total_price_gbp NUMERIC(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  enom_order_id TEXT,
  enom_domain_id TEXT,
  provisioned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hosting Orders Table
CREATE TABLE IF NOT EXISTS public.hosting_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  hosting_package_id UUID NOT NULL REFERENCES hosting_packages(id),
  domain_name TEXT,
  status TEXT DEFAULT 'pending',
  hosting_price_gbp NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  whm_account_id TEXT,
  cpanel_username TEXT,
  cpanel_password TEXT,
  server_ip TEXT,
  provisioned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  suspended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.domain_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage domain prices" ON public.domain_prices FOR ALL USING (is_admin_user());
CREATE POLICY "Anyone can view domain prices" ON public.domain_prices FOR SELECT USING (true);

CREATE POLICY "Admins can manage exchange rates" ON public.exchange_rates FOR ALL USING (is_admin_user());
CREATE POLICY "Anyone can view exchange rates" ON public.exchange_rates FOR SELECT USING (true);

CREATE POLICY "Admins can manage domain orders" ON public.domain_orders FOR ALL USING (is_admin_user());
CREATE POLICY "Customers can view own domain orders" ON public.domain_orders FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Admins can manage hosting orders" ON public.hosting_orders FOR ALL USING (is_admin_user());
CREATE POLICY "Customers can view own hosting orders" ON public.hosting_orders FOR SELECT USING (customer_id = auth.uid());

-- Insert default TLD pricing data
INSERT INTO public.domain_prices (tld, retail_usd, retail_gbp, id_protect_gbp, source, is_override) VALUES
('.com', 12.99, 10.99, 7.99, 'default', false),
('.co.uk', 9.99, 9.99, 7.99, 'default', false),
('.org', 14.99, 12.99, 7.99, 'default', false),
('.net', 13.99, 11.99, 7.99, 'default', false),
('.uk', 9.99, 9.99, 7.99, 'default', false)
ON CONFLICT (tld) DO NOTHING;

-- Insert default exchange rate if not exists
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, expires_at) VALUES
('USD', 'GBP', 0.79, now() + interval '24 hours')
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domain_prices_tld ON public.domain_prices(tld);
CREATE INDEX IF NOT EXISTS idx_domain_prices_updated ON public.domain_prices(updated_at);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON public.exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_domain_orders_customer ON public.domain_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_hosting_orders_customer ON public.hosting_orders(customer_id);

-- Update existing email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
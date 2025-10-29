-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('it_support', 'website_care')),
  price_monthly DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  add_ons TEXT[] DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create customer_subscriptions table
CREATE TABLE public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_billing_date DATE NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for customer_subscriptions
CREATE POLICY "Customers can view own subscriptions"
  ON public.customer_subscriptions
  FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create own subscriptions"
  ON public.customer_subscriptions
  FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions"
  ON public.customer_subscriptions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_subscriptions_updated_at
  BEFORE UPDATE ON public.customer_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed IT Support Plans
INSERT INTO public.subscription_plans (name, description, category, price_monthly, features, add_ons, display_order) VALUES
(
  'Essential Plan',
  'Ideal for individuals and light users who need reliable remote help.',
  'it_support',
  33.00,
  '["Unlimited remote support sessions", "Device health checks (monthly)", "Basic virus/malware removal", "Software installation & troubleshooting", "Network and Wi-Fi setup guidance", "General IT advice via email or WhatsApp"]'::jsonb,
  ARRAY['On-site diagnostics & repairs (quote on request)', 'Hardware upgrades or installations', 'Network cabling & Wi-Fi extension', 'Device pickup/drop-off service', 'Home or business IT setup (monitors, printers, routers, etc.)'],
  1
),
(
  'Pro Plan',
  'For users and small offices needing proactive support and data care.',
  'it_support',
  66.00,
  '["Everything in Essential", "Cloud & local data backup assistance", "System optimization (quarterly)", "Printer, router & peripheral setup help", "Security & privacy audits", "Priority response during business hours"]'::jsonb,
  ARRAY['On-site diagnostics & repairs (quote on request)', 'Hardware upgrades or installations', 'Network cabling & Wi-Fi extension', 'Device pickup/drop-off service', 'Home or business IT setup (monitors, printers, routers, etc.)'],
  2
),
(
  'Elite Plan',
  'Full digital care — perfect for small business owners or power users.',
  'it_support',
  99.00,
  '["Everything in Pro", "Monthly device tune-ups & performance reports", "Advanced data recovery assistance", "Email & cloud storage management", "Personal tech concierge (dedicated technician)", "Priority phone & WhatsApp support (7 days/week)"]'::jsonb,
  ARRAY['On-site diagnostics & repairs (quote on request)', 'Hardware upgrades or installations', 'Network cabling & Wi-Fi extension', 'Device pickup/drop-off service', 'Home or business IT setup (monitors, printers, routers, etc.)'],
  3
);

-- Seed Website Care Plans
INSERT INTO public.subscription_plans (name, description, category, price_monthly, features, add_ons, display_order) VALUES
(
  'Basic Care',
  'Ideal for small sites and personal pages that need simple upkeep.',
  'website_care',
  33.00,
  '["Monthly core & plugin updates", "SSL certificate renewal", "Security & uptime monitoring", "1 hour of content edits per month", "Performance check & cache cleanup", "Email & chat support during business hours"]'::jsonb,
  ARRAY['Website redesign or theme upgrade', 'E-commerce store management (product uploads, inventory)', 'Content writing & blog publishing', 'Migration to 404 hosting', 'Performance overhaul or speed rebuild', 'In-depth SEO consultation'],
  1
),
(
  'Pro Care',
  'For small businesses and creators needing faster updates and SEO insight.',
  'website_care',
  66.00,
  '["Weekly updates & backups", "3 hours of content edits per month", "Monthly SEO & performance report", "Priority email support", "Image optimization & speed improvements", "Plugin & dependency health check"]'::jsonb,
  ARRAY['Website redesign or theme upgrade', 'E-commerce store management (product uploads, inventory)', 'Content writing & blog publishing', 'Migration to 404 hosting', 'Performance overhaul or speed rebuild', 'In-depth SEO consultation'],
  2
),
(
  'Enterprise Care',
  'For growing sites and e-commerce businesses that need full, proactive care.',
  'website_care',
  99.00,
  '["Daily monitoring & automated backups", "Unlimited content updates", "Malware scanning & security hardening", "Advanced SEO tracking & analytics report", "Priority response within 4 hours", "404 team access for design or structural edits"]'::jsonb,
  ARRAY['Website redesign or theme upgrade', 'E-commerce store management (product uploads, inventory)', 'Content writing & blog publishing', 'Migration to 404 hosting', 'Performance overhaul or speed rebuild', 'In-depth SEO consultation'],
  3
);
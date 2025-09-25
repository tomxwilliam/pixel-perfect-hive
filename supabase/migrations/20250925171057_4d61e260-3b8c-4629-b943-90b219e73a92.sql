-- Create domain TLD pricing table
CREATE TABLE IF NOT EXISTS public.domain_tld_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld TEXT NOT NULL UNIQUE,                  
  category TEXT NOT NULL DEFAULT 'gTLD',     
  reg_1y_gbp NUMERIC(10,2),
  reg_2y_gbp NUMERIC(10,2),
  reg_5y_gbp NUMERIC(10,2),
  reg_10y_gbp NUMERIC(10,2),
  renew_1y_gbp NUMERIC(10,2),
  transfer_1y_gbp NUMERIC(10,2),
  reg_1y_usd NUMERIC(10,2),
  reg_2y_usd NUMERIC(10,2),
  reg_5y_usd NUMERIC(10,2),
  reg_10y_usd NUMERIC(10,2),
  renew_1y_usd NUMERIC(10,2),
  transfer_1y_usd NUMERIC(10,2),
  usd_to_gbp_rate NUMERIC(10,6) NOT NULL DEFAULT 0.7397,
  source TEXT NOT NULL DEFAULT 'enom_api',   
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.domain_tld_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage domain TLD pricing" 
ON public.domain_tld_pricing 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "Anyone can view domain TLD pricing" 
ON public.domain_tld_pricing 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_domain_tld_pricing_tld ON public.domain_tld_pricing (tld);
CREATE INDEX IF NOT EXISTS idx_domain_tld_pricing_category ON public.domain_tld_pricing (category);
CREATE INDEX IF NOT EXISTS idx_domain_tld_pricing_updated_at ON public.domain_tld_pricing (updated_at DESC);
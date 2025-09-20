-- Add separate pricing columns for register, renew, and transfer
ALTER TABLE public.domain_prices 
ADD COLUMN IF NOT EXISTS register_price_usd NUMERIC,
ADD COLUMN IF NOT EXISTS register_price_gbp NUMERIC,
ADD COLUMN IF NOT EXISTS renew_price_usd NUMERIC,  
ADD COLUMN IF NOT EXISTS renew_price_gbp NUMERIC,
ADD COLUMN IF NOT EXISTS transfer_price_usd NUMERIC,
ADD COLUMN IF NOT EXISTS transfer_price_gbp NUMERIC;

-- Update existing records to use the new structure
UPDATE public.domain_prices 
SET 
  register_price_usd = retail_usd,
  register_price_gbp = retail_gbp,
  renew_price_usd = retail_usd,
  renew_price_gbp = retail_gbp,
  transfer_price_usd = retail_usd,
  transfer_price_gbp = retail_gbp
WHERE register_price_gbp IS NULL;
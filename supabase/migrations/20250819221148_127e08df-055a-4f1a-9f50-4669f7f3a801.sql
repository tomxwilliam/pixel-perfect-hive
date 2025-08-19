-- Add tide_payment_link column to service_pricing_defaults table
ALTER TABLE public.service_pricing_defaults 
ADD COLUMN tide_payment_link TEXT;
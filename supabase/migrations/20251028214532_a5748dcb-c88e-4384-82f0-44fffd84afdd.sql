-- Phase 4: Cleanup & Optimization
-- Drop legacy domain and hosting tables

DROP TABLE IF EXISTS public.domain_orders CASCADE;
DROP TABLE IF EXISTS public.domains CASCADE;
DROP TABLE IF EXISTS public.domain_prices CASCADE;
DROP TABLE IF EXISTS public.domain_tld_pricing CASCADE;
DROP TABLE IF EXISTS public.hosting_subscriptions CASCADE;
DROP TABLE IF EXISTS public.hosting_accounts CASCADE;
DROP TABLE IF EXISTS public.hosting_packages CASCADE;
DROP TABLE IF EXISTS public.provisioning_requests CASCADE;

-- Drop social media tables (unused)
DROP TABLE IF EXISTS public.social_posts CASCADE;
DROP TABLE IF EXISTS public.social_accounts CASCADE;
DROP TABLE IF EXISTS public.social_media_settings CASCADE;
DROP TABLE IF EXISTS public.social_media_metrics CASCADE;

-- Drop domain_settings table as it's no longer needed
DROP TABLE IF EXISTS public.domain_settings CASCADE;

-- Add comment for documentation
COMMENT ON DATABASE postgres IS 'Cleaned up legacy domain/hosting and social media tables - now using 20i partner affiliate model';
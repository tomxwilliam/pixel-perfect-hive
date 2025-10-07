-- =====================================================
-- PHASE 1: FIX CRITICAL AUTHORIZATION BYPASS VULNERABILITIES
-- =====================================================
-- This migration fixes insecure authorization checks that could allow
-- privilege escalation attacks.

-- Fix: Update RLS policies that directly check profiles.role
-- These tables currently use profiles.role which can be manipulated
-- They should use has_role() function which checks the secure user_roles table

-- Update api_integrations RLS policies if they exist
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Admin only api integrations" ON public.api_integrations;
  
  -- Create new secure policy
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_integrations') THEN
    CREATE POLICY "Admins can manage API integrations"
      ON public.api_integrations
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
    
    RAISE NOTICE 'Updated RLS policy for api_integrations';
  END IF;
END $$;

-- Update social_accounts RLS policies if they exist
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Admin only social accounts" ON public.social_accounts;
  
  -- Create new secure policy
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_accounts') THEN
    CREATE POLICY "Admins can manage social accounts"
      ON public.social_accounts
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
    
    RAISE NOTICE 'Updated RLS policy for social_accounts';
  END IF;
END $$;

-- Update org_billing_settings RLS policies if they exist
DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Admin only org billing settings" ON public.org_billing_settings;
  
  -- Create new secure policy
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'org_billing_settings') THEN
    CREATE POLICY "Admins can manage org billing settings"
      ON public.org_billing_settings
      FOR ALL
      USING (public.has_role(auth.uid(), 'admin'));
    
    RAISE NOTICE 'Updated RLS policy for org_billing_settings';
  END IF;
END $$;

-- Add comments to remind developers about security best practices
COMMENT ON FUNCTION public.has_role(uuid, app_role) IS 
'SECURITY: Always use this function for role checks. Never check profiles.role directly as it can be manipulated by users. This function queries the secure user_roles table which is properly protected by RLS.';

-- Verify all critical tables have proper RLS enabled
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('api_integrations', 'social_accounts', 'org_billing_settings')
  LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = tbl AND relnamespace = 'public'::regnamespace) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      RAISE NOTICE 'Enabled RLS on %', tbl;
    END IF;
  END LOOP;
END $$;
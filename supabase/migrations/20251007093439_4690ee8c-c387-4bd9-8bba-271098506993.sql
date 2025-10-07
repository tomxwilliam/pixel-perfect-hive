-- =====================================================
-- FIX SECURITY DEFINER VIEW VULNERABILITY
-- =====================================================

-- The admin_oauth_connections_view uses SECURITY DEFINER functions
-- which can bypass RLS policies in unexpected ways. This is a security risk.
-- 
-- Solution: Drop the view and rely on direct table access with proper RLS
-- and secure RPC functions for decryption.

-- Drop the problematic view
DROP VIEW IF EXISTS public.admin_oauth_connections_view;

-- Drop any other potentially problematic views that might exist
DROP VIEW IF EXISTS public.customer_hosting_accounts_view;
DROP VIEW IF EXISTS public.customer_hosting_orders_view;

-- Add helpful comments to guide developers
COMMENT ON TABLE public.oauth_connections IS 
'SECURITY: OAuth tokens are encrypted at rest. Admins should query this table directly (RLS policies ensure admin-only access) and use store_oauth_connection(), get_oauth_access_token(), and update_oauth_tokens() RPC functions for token operations. Never create views that call SECURITY DEFINER functions as they can bypass RLS policies.';

COMMENT ON TABLE public.hosting_accounts IS
'SECURITY: cPanel passwords are encrypted at rest. Admins should query this table directly (RLS policies ensure proper access) and use reset_hosting_password() RPC function for password operations. Customers have NO access to encrypted password fields.';

COMMENT ON TABLE public.hosting_orders IS
'SECURITY: cPanel passwords are encrypted at rest. Admins should query this table directly (RLS policies ensure proper access) and use reset_hosting_password() RPC function for password operations. Customers have NO access to encrypted password fields.';

-- Verify RLS is enabled on sensitive tables
DO $$
BEGIN
  -- Ensure RLS is enabled
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'oauth_connections' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on oauth_connections';
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'hosting_accounts' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.hosting_accounts ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on hosting_accounts';
  END IF;
  
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'hosting_orders' AND relnamespace = 'public'::regnamespace) THEN
    ALTER TABLE public.hosting_orders ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on hosting_orders';
  END IF;
END $$;
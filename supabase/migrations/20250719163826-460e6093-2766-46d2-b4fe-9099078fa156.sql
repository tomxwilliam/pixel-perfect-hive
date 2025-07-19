
-- Drop the problematic admin policies that try to access auth.users
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;

-- Create a security definer function that can safely check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@404codelab.com'
    )
  END;
$$;

-- Create new admin policies using the security definer function
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE USING (public.is_admin_user());

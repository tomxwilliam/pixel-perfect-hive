
-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_during_signup" ON public.profiles;

-- Drop the problematic is_admin function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create simple, non-recursive policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_during_signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create a simple admin policy that doesn't cause recursion
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email LIKE '%@404codelab.com'
      )
    END
  );

CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email LIKE '%@404codelab.com'
      )
    END
  );

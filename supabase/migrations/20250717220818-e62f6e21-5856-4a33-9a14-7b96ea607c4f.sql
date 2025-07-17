-- Just update the RLS policies for better reliability
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE public.is_admin(auth.uid())
    END
  );

-- Allow profile creation during signup (this is critical)
CREATE POLICY "Allow profile creation during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);
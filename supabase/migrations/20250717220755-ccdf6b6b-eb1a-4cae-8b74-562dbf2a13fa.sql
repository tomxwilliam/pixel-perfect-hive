-- Step 1: Create the missing trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 2: Drop and recreate RLS policies for better reliability
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
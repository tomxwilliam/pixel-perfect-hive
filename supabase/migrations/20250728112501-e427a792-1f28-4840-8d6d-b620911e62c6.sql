-- Fix profile creation system for sign-up issues

-- First, let's check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with proper error handling
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email LIKE '%@404codelab.com' THEN 'admin'::public.user_role
      ELSE 'customer'::public.user_role
    END
  ) ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the RLS policies for profiles to allow proper sign-up
DROP POLICY IF EXISTS "profiles_insert_during_signup" ON public.profiles;

-- Create a proper policy that allows profile creation during sign-up
CREATE POLICY "profiles_insert_during_signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Allow all inserts since this is handled by the trigger

-- Also ensure users can read their own profiles after creation
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure users can update their own profiles
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Admin policies
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" 
ON public.profiles 
FOR SELECT 
USING (is_admin_user());

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
CREATE POLICY "profiles_admin_update_all" 
ON public.profiles 
FOR UPDATE 
USING (is_admin_user());
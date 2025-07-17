
-- Fix the handle_new_user function to properly cast the role to the enum type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN new.email LIKE '%@404codelab.com' THEN 'admin'::public.user_role
      ELSE 'customer'::public.user_role
    END
  );
  RETURN new;
END;
$$;

-- Fix app_store_links RLS policies to use secure user_roles table
-- This replaces email pattern matching with the proper has_role() function

-- Drop old insecure policies
DROP POLICY IF EXISTS "Admin users can insert app store links" ON app_store_links;
DROP POLICY IF EXISTS "Admin users can view app store links" ON app_store_links;
DROP POLICY IF EXISTS "Admin users can update app store links" ON app_store_links;
DROP POLICY IF EXISTS "Admin users can delete app store links" ON app_store_links;

-- Create single secure policy for all admin operations
CREATE POLICY "Admins can manage app store links"
  ON app_store_links
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public read policy remains unchanged (already correct)
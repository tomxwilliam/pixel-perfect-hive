-- Fix RLS policy for app_projects to allow INSERT operations
DROP POLICY IF EXISTS "Admins can manage app projects" ON public.app_projects;

CREATE POLICY "Admins can manage app projects" ON public.app_projects
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
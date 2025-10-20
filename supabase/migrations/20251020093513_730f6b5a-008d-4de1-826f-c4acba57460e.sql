-- Add screenshots column to app_projects table
ALTER TABLE public.app_projects 
ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}';

COMMENT ON COLUMN public.app_projects.screenshots IS 'Array of screenshot URLs for the app project (max 5)';
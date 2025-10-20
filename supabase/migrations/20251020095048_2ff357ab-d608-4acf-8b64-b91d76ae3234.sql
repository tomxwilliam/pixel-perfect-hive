-- Add screenshots column to web_projects table
ALTER TABLE public.web_projects 
ADD COLUMN screenshots text[] DEFAULT '{}'::text[];

-- Create file_uploads table for managing uploaded files
CREATE TABLE public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  entity_type TEXT, -- 'project', 'ticket', 'message', etc.
  entity_id UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on file_uploads
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Users can view files they uploaded or files related to their entities
CREATE POLICY "users_can_view_own_files" ON public.file_uploads
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = entity_id AND projects.customer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM tickets WHERE tickets.id = entity_id AND tickets.customer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

-- Users can upload files
CREATE POLICY "users_can_upload_files" ON public.file_uploads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own files (or admins can delete any)
CREATE POLICY "users_can_delete_own_files" ON public.file_uploads
  FOR DELETE
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
    )
  );

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);

-- Create storage policy for uploads bucket
CREATE POLICY "users_can_upload_files" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users_can_view_own_files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'uploads' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  );

CREATE POLICY "users_can_delete_own_files" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'uploads' AND 
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  );

-- Add user preferences table for theme and other settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
CREATE POLICY "users_can_manage_own_preferences" ON public.user_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger to update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at
  BEFORE UPDATE ON public.file_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

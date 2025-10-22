-- Create table for pending admin invitations (for users who haven't signed up yet)
CREATE TABLE public.pending_admin_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_admin_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Only admins can manage pending invitations
CREATE POLICY "Admin only pending invitations" 
ON public.pending_admin_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_pending_admin_invitations_updated_at
  BEFORE UPDATE ON public.pending_admin_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for email lookups
CREATE INDEX idx_pending_admin_invitations_email ON public.pending_admin_invitations(email);

-- Function to automatically grant admin role when pending invitation exists
CREATE OR REPLACE FUNCTION public.handle_pending_admin_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Check if there's a pending admin invitation for this email
  IF EXISTS (
    SELECT 1 FROM pending_admin_invitations 
    WHERE email = user_email
  ) THEN
    -- Grant admin role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Delete the pending invitation
    DELETE FROM pending_admin_invitations WHERE email = user_email;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to check for pending admin invitations when a new profile is created
CREATE TRIGGER on_profile_created_check_pending_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pending_admin_invitation();
-- Create oauth_connections table for storing OAuth tokens
CREATE TABLE public.oauth_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  account_id TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on user_id and provider
CREATE UNIQUE INDEX oauth_connections_user_provider_idx ON public.oauth_connections (user_id, provider);

-- Enable Row Level Security
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all OAuth connections
CREATE POLICY "Admins can manage all oauth connections" 
ON public.oauth_connections 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'::user_role
));

-- Create trigger for updating updated_at column
CREATE TRIGGER update_oauth_connections_updated_at
BEFORE UPDATE ON public.oauth_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
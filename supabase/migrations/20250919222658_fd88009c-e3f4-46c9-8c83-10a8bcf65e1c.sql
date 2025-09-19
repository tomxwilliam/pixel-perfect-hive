-- Create app store links table for managing download links
CREATE TABLE public.app_store_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT NOT NULL,
  ios_link TEXT,
  google_play_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_store_links ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (only users with @404codelab.com emails can manage)
CREATE POLICY "Admin users can view app store links" 
ON public.app_store_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@404codelab.com'
  )
);

CREATE POLICY "Admin users can insert app store links" 
ON public.app_store_links 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@404codelab.com'
  )
);

CREATE POLICY "Admin users can update app store links" 
ON public.app_store_links 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@404codelab.com'
  )
);

CREATE POLICY "Admin users can delete app store links" 
ON public.app_store_links 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email LIKE '%@404codelab.com'
  )
);

-- Public read access for displaying links on the website
CREATE POLICY "Public can view active app store links" 
ON public.app_store_links 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_store_links_updated_at
BEFORE UPDATE ON public.app_store_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data for BeeVerse
INSERT INTO public.app_store_links (game_name, ios_link, google_play_link, is_active) 
VALUES ('BeeVerse', '', '', true);
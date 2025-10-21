-- Create featured_content table for managing homepage featured content boxes
CREATE TABLE IF NOT EXISTS public.featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  cta_text TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  gradient_from TEXT,
  gradient_to TEXT,
  border_color TEXT,
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;

-- Public can view active featured content
CREATE POLICY "Anyone can view active featured content"
  ON public.featured_content
  FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

-- Admins can manage all featured content
CREATE POLICY "Admins can manage featured content"
  ON public.featured_content
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_featured_content_active ON public.featured_content(is_active, display_order);
CREATE INDEX idx_featured_content_dates ON public.featured_content(start_date, end_date);

-- Add updated_at trigger
CREATE TRIGGER update_featured_content_updated_at
  BEFORE UPDATE ON public.featured_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial BeeVerse data as example
INSERT INTO public.featured_content (
  title,
  subtitle,
  description,
  icon,
  cta_text,
  cta_link,
  gradient_from,
  gradient_to,
  border_color,
  is_active,
  display_order,
  created_by
) VALUES (
  'Now Featuring: BeeVerse',
  'The ultimate idle bee empire game',
  'Download now on iPhone',
  '🐝',
  'App Store',
  'https://apps.apple.com/gb/app/beeverse/id6738193488',
  'yellow-500',
  'orange-500',
  'yellow-500',
  true,
  0,
  (SELECT id FROM auth.users WHERE email LIKE '%@404codelab.com' LIMIT 1)
);
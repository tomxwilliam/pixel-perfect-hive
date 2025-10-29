-- Create page_content table for managing all website page content
CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Page Identification
  page_route TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  page_type TEXT NOT NULL,
  
  -- SEO Meta Data
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  no_index BOOLEAN DEFAULT false,
  
  -- Page Content Sections (JSONB)
  hero_section JSONB DEFAULT '{}'::jsonb,
  content_sections JSONB[] DEFAULT ARRAY[]::jsonb[],
  features JSONB[] DEFAULT ARRAY[]::jsonb[],
  testimonials JSONB[] DEFAULT ARRAY[]::jsonb[],
  cta_section JSONB DEFAULT '{}'::jsonb,
  faq_items JSONB[] DEFAULT ARRAY[]::jsonb[],
  
  -- Additional Settings
  custom_css TEXT,
  custom_scripts TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active pages
CREATE POLICY "Anyone can view active pages"
  ON public.page_content FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage all pages
CREATE POLICY "Admins can manage all pages"
  ON public.page_content FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_page_content_route ON public.page_content(page_route);
CREATE INDEX idx_page_content_type ON public.page_content(page_type);

-- Auto-update timestamp trigger
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
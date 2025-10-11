-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Status fields
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'in_concept' CHECK (status IN ('in_concept', 'early_development', 'active_development', 'launched')),
  
  -- Key selling points
  key_point_1 TEXT,
  key_point_1_icon TEXT,
  key_point_2 TEXT,
  key_point_2_icon TEXT,
  key_point_3 TEXT,
  key_point_3_icon TEXT,
  
  -- Download links
  ios_link TEXT,
  google_play_link TEXT,
  
  -- Images
  logo_url TEXT,
  feature_image_url TEXT,
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Public can view all games
CREATE POLICY "Anyone can view games" ON public.games
  FOR SELECT USING (true);

-- Only admins can manage games
CREATE POLICY "Admins can manage games" ON public.games
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for ordering
CREATE INDEX games_display_order_idx ON public.games(display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for game assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for game assets
CREATE POLICY "Public can view game assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-assets');

CREATE POLICY "Admins can upload game assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'game-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update game assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'game-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete game assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'game-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing BeeVerse game
INSERT INTO public.games (
  name,
  description,
  is_featured,
  status,
  key_point_1,
  key_point_1_icon,
  key_point_2,
  key_point_2_icon,
  key_point_3,
  key_point_3_icon,
  logo_url,
  feature_image_url,
  display_order
) VALUES (
  'BeeVerse',
  'The ultimate idle bee empire game where bees run the economy. Build your hive, manage your workers, and watch your empire grow!',
  true,
  'active_development',
  'Strategic upgrades and prestige systems',
  'Star',
  'Smart buff mechanics and automation',
  'Zap',
  'Currently in active development',
  'TrendingUp',
  '/assets/beevers-icon.png',
  '/lovable-uploads/621f61df-74f7-45ba-b1d7-4c1b7251d429.png',
  1
);
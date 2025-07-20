
-- Enhance existing social_posts table with additional columns
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS engagement_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS media_urls TEXT[],
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS character_count INTEGER,
ADD COLUMN IF NOT EXISTS hashtags TEXT[],
ADD COLUMN IF NOT EXISTS account_id UUID,
ADD COLUMN IF NOT EXISTS post_url TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Create social_accounts table for OAuth tokens and account info
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin')),
  account_username TEXT NOT NULL,
  account_display_name TEXT,
  account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- Create social_media_metrics table for tracking engagement analytics
CREATE TABLE IF NOT EXISTS public.social_media_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create hashtag_suggestions table for trending hashtags
CREATE TABLE IF NOT EXISTS public.hashtag_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'general')),
  hashtag TEXT NOT NULL,
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  trending_score DECIMAL(5,2) DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, hashtag)
);

-- Create social_media_settings table for team permissions and configuration
CREATE TABLE IF NOT EXISTS public.social_media_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT true,
  can_create_posts BOOLEAN DEFAULT false,
  can_schedule_posts BOOLEAN DEFAULT false,
  can_delete_posts BOOLEAN DEFAULT false,
  can_manage_accounts BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{"failed_posts": true, "scheduled_success": true, "token_expiry": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add foreign key constraint to social_posts for account_id
ALTER TABLE public.social_posts 
ADD CONSTRAINT fk_social_posts_account 
FOREIGN KEY (account_id) REFERENCES public.social_accounts(id) ON DELETE SET NULL;

-- Enable Row Level Security on new tables
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_accounts (Admin only)
CREATE POLICY "Admin only social accounts" ON public.social_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for social_media_metrics (Admin only)
CREATE POLICY "Admin only social metrics" ON public.social_media_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for hashtag_suggestions (Admin only)
CREATE POLICY "Admin only hashtag suggestions" ON public.hashtag_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for social_media_settings
CREATE POLICY "Users can manage own social settings" ON public.social_media_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all social settings" ON public.social_media_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add update triggers for timestamp columns
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_hashtag_suggestions_updated_at BEFORE UPDATE ON public.hashtag_suggestions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_social_media_settings_updated_at BEFORE UPDATE ON public.social_media_settings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_active ON public.social_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_social_media_metrics_date ON public.social_media_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_social_media_metrics_account ON public.social_media_metrics(account_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_platform ON public.hashtag_suggestions(platform);
CREATE INDEX IF NOT EXISTS idx_hashtag_suggestions_trending ON public.hashtag_suggestions(trending_score DESC);

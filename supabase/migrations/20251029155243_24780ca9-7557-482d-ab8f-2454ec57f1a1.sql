-- Create ads landing pages table
CREATE TABLE public.ads_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL UNIQUE CHECK (page_type IN ('web_development', 'game_development', 'app_development')),
  urgency_message TEXT NOT NULL,
  headline TEXT NOT NULL,
  subheadline TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  cta_subtext TEXT NOT NULL,
  trust_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads_landing_pages ENABLE ROW LEVEL SECURITY;

-- Admin can manage all
CREATE POLICY "Admins can manage ads landing pages"
ON public.ads_landing_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active pages
CREATE POLICY "Public can view active ads landing pages"
ON public.ads_landing_pages
FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_ads_landing_pages_updated_at
BEFORE UPDATE ON public.ads_landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data with existing content
INSERT INTO public.ads_landing_pages (page_type, urgency_message, headline, subheadline, meta_title, meta_description, cta_text, cta_subtext, trust_signals, testimonials)
VALUES 
(
  'web_development',
  '🔥 Book this week and save 10% on your project',
  'Professional Web Development Starting at £299',
  'Launch Your Website in 2 Weeks - No Hidden Fees, 100% Satisfaction Guaranteed',
  'Professional Web Development Starting at £299 | 404 Code Lab',
  'Launch your professional website in 2 weeks. SEO-optimised, mobile-responsive, and built to convert. No hidden fees. Get your free quote today.',
  'Get Your Free Quote Today',
  'No obligation. Receive your custom quote within 24 hours.',
  '[
    {"value": "150+", "label": "Websites Built"},
    {"value": "98%", "label": "Client Satisfaction"},
    {"value": "< 2s", "label": "Load Time"}
  ]'::jsonb,
  '[
    {
      "quote": "Our new website increased leads by 300% in the first month. The team at 404 Code Lab delivered beyond our expectations.",
      "author": "Sarah Johnson",
      "role": "CEO, TechStart Inc",
      "rating": 5
    },
    {
      "quote": "Professional, fast, and affordable. They turned our vision into reality and the site performs flawlessly.",
      "author": "Mike Chen",
      "role": "Founder, GreenEats",
      "rating": 5
    },
    {
      "quote": "Best investment we made for our business. The website pays for itself with the new clients we get every week.",
      "author": "Jennifer Martinez",
      "role": "Owner, Elite Fitness",
      "rating": 5
    }
  ]'::jsonb
),
(
  'game_development',
  '🎮 Limited slots available - Book your consultation today',
  'Professional Mobile Game Development',
  'From Concept to Launch - Build Your Dream Game with Expert Developers',
  'Professional Mobile Game Development | 404 Code Lab',
  'Transform your game idea into reality. Expert Unity & Unreal Engine developers. iOS & Android publishing. Get your free consultation today.',
  'Get Your Free Consultation',
  'No obligation. Discuss your game idea with our expert team.',
  '[
    {"value": "50+", "label": "Games Launched"},
    {"value": "1M+", "label": "Downloads"},
    {"value": "4.8★", "label": "Average Rating"}
  ]'::jsonb,
  '[
    {
      "quote": "404 Code Lab brought our game vision to life perfectly. The attention to detail and performance optimization was outstanding.",
      "author": "Alex Thompson",
      "role": "Game Designer, Pixel Studios",
      "rating": 5
    },
    {
      "quote": "From concept to App Store, they handled everything professionally. Our game hit 100K downloads in the first month!",
      "author": "Maria Rodriguez",
      "role": "Founder, Indie Game Co",
      "rating": 5
    },
    {
      "quote": "The team''s expertise in Unity and mobile optimization made our game run smoothly on all devices. Highly recommend!",
      "author": "David Kim",
      "role": "CEO, GameForge",
      "rating": 5
    }
  ]'::jsonb
),
(
  'app_development',
  '📱 Start your app journey today - Free consultation available',
  'Custom Mobile App Development',
  'iOS & Android Apps Built by Experts - From Idea to App Store',
  'Custom Mobile App Development | 404 Code Lab',
  'Professional iOS & Android app development. Native and cross-platform solutions. User-friendly design. Robust backend. Get your free quote today.',
  'Get Your Free Quote Today',
  'No obligation. Receive your custom app development quote within 24 hours.',
  '[
    {"value": "100+", "label": "Apps Launched"},
    {"value": "500K+", "label": "Active Users"},
    {"value": "99%", "label": "Uptime"}
  ]'::jsonb,
  '[
    {
      "quote": "Our fitness app has transformed our business. 404 Code Lab delivered a polished, professional product that our users love.",
      "author": "Emma Wilson",
      "role": "Founder, FitLife App",
      "rating": 5
    },
    {
      "quote": "The development process was smooth and transparent. They built exactly what we needed and helped us scale to 100K users.",
      "author": "James Park",
      "role": "CTO, HealthTrack",
      "rating": 5
    },
    {
      "quote": "Incredible attention to UX and performance. Our delivery app runs flawlessly and customers love the interface.",
      "author": "Sophie Anderson",
      "role": "CEO, QuickDeliver",
      "rating": 5
    }
  ]'::jsonb
);
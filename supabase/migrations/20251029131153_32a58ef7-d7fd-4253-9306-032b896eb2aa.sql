-- Insert blog categories for 404 Code Lab services and content types
INSERT INTO blog_categories (name, slug, description, icon, color, display_order, is_active, post_count) VALUES
  ('Game Development', 'game-development', 'Tips, tutorials, and insights on mobile game development, Unity, monetization strategies, and game design', '🎮', 'hsl(var(--primary))', 1, true, 0),
  ('Mobile Apps', 'mobile-apps', 'Guides on iOS and Android app development, React Native, UX/UI design, and App Store optimization', '📱', 'hsl(var(--accent))', 2, true, 0),
  ('Web Development', 'web-development', 'Web development best practices, modern frameworks, performance optimization, and SEO strategies', '💻', 'hsl(var(--secondary))', 3, true, 0),
  ('AI & Machine Learning', 'ai-machine-learning', 'Exploring AI integration, chatbots, automation, and practical machine learning applications for businesses', '🤖', 'hsl(262 83% 58%)', 4, true, 0),
  ('Business & Strategy', 'business-strategy', 'Digital transformation, project management, ROI optimization, and tech business strategies', '📊', 'hsl(221 83% 53%)', 5, true, 0),
  ('Design & UX', 'design-ux', 'User experience design, UI trends, branding, and creating engaging digital products', '🎨', 'hsl(330 81% 60%)', 6, true, 0),
  ('Tutorials & Guides', 'tutorials-guides', 'Step-by-step technical tutorials, how-to guides, and code snippets for developers', '📚', 'hsl(142 76% 36%)', 7, true, 0),
  ('Case Studies', 'case-studies', 'Success stories, project showcases, and real-world examples of our work', '⭐', 'hsl(38 92% 50%)', 8, true, 0),
  ('Industry News', 'industry-news', 'Latest tech news, framework updates, industry trends, and what''s new in software development', '📰', 'hsl(189 94% 43%)', 9, true, 0),
  ('Company Updates', 'company-updates', 'News from 404 Code Lab, team updates, new services, and company milestones', '🚀', 'hsl(239 84% 67%)', 10, true, 0)
ON CONFLICT (slug) DO NOTHING;
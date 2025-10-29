-- Seed page_content table with 11 priority public pages
-- This enables SEO management and content editing through admin panel

-- 1. Home Page (/)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description, 
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/',
  'Home',
  'main',
  '404 Code Lab - Web Development, Mobile Apps & Games',
  'Professional web development, mobile app creation, and game development services in Scotland. Custom solutions built from scratch with cutting-edge technology.',
  'https://404codelab.com',
  '404 Code Lab - Digital Innovation & Development',
  'Transform your ideas into reality with professional web development, mobile apps, and games. Based in Scotland, serving clients globally.',
  'summary_large_image',
  '{"headline": "Transform Your Digital Vision Into Reality", "subheadline": "Professional web development, mobile apps, and games crafted with precision", "badgeText": "Scotland-Based Digital Studio", "ctaText": "Start Your Project", "ctaLink": "/dashboard/new-project"}'::jsonb,
  true
);

-- 2. About Page (/about)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/about',
  'About Us',
  'main',
  'About 404 Code Lab - Scotland-Based Digital Studio',
  'Learn about 404 Code Lab, a Scotland-based digital studio specializing in custom web development, mobile apps, and games. Built from scratch, performance-first, user-focused.',
  'https://404codelab.com/about',
  'About 404 Code Lab - Our Story & Values',
  'Discover our mission to create exceptional digital experiences through custom development, cutting-edge technology, and user-centered design.',
  'summary_large_image',
  '{"headline": "Building Digital Excellence", "subheadline": "A Scotland-based studio crafting custom digital solutions", "badgeText": "Our Story"}'::jsonb,
  true
);

-- 3. Contact Page (/contact)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/contact',
  'Contact',
  'main',
  'Contact 404 Code Lab - Get In Touch',
  'Get in touch with 404 Code Lab for web development, mobile apps, or game development projects. Based in Scotland, serving clients worldwide.',
  'https://404codelab.com/contact',
  'Contact 404 Code Lab',
  'Reach out to discuss your web development, mobile app, or game development project. We''re here to help bring your ideas to life.',
  'summary_large_image',
  '{"headline": "Let''s Create Something Amazing", "subheadline": "Get in touch to discuss your project", "badgeText": "Contact Us"}'::jsonb,
  true
);

-- 4. Web Portfolio (/portfolio/web)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/portfolio/web',
  'Web Development Portfolio',
  'portfolio',
  'Web Development Portfolio - 404 Code Lab Projects',
  'Explore our web development portfolio featuring custom websites, web applications, and digital solutions. See our work in action.',
  'https://404codelab.com/portfolio/web',
  'Web Development Portfolio - 404 Code Lab',
  'Discover stunning websites and web applications we''ve built for clients. From e-commerce to custom platforms.',
  'summary_large_image',
  '{"headline": "Web Development Portfolio", "subheadline": "Crafting exceptional digital experiences", "badgeText": "Our Work"}'::jsonb,
  true
);

-- 5. App Portfolio (/portfolio/apps)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/portfolio/apps',
  'Mobile App Portfolio',
  'portfolio',
  'Mobile App Portfolio - iOS & Android Apps by 404 Code Lab',
  'View our mobile app development portfolio. Native iOS and Android applications built with cutting-edge technology and beautiful design.',
  'https://404codelab.com/portfolio/apps',
  'Mobile App Portfolio - 404 Code Lab',
  'Explore innovative mobile applications we''ve developed for iOS and Android. From productivity tools to social platforms.',
  'summary_large_image',
  '{"headline": "Mobile App Portfolio", "subheadline": "iOS & Android applications that users love", "badgeText": "Our Apps"}'::jsonb,
  true
);

-- 6. Game Portfolio (/portfolio/games)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/portfolio/games',
  'Game Development Portfolio',
  'portfolio',
  'Game Development Portfolio - Mobile Games by 404 Code Lab',
  'Check out our mobile game development portfolio. Engaging, performance-optimized games for iOS and Android platforms.',
  'https://404codelab.com/portfolio/games',
  'Game Development Portfolio - 404 Code Lab',
  'Discover exciting mobile games we''ve created. From casual puzzles to immersive experiences.',
  'summary_large_image',
  '{"headline": "Game Development Portfolio", "subheadline": "Creating engaging mobile gaming experiences", "badgeText": "Our Games"}'::jsonb,
  true
);

-- 7. AI Integration Service (/services/ai-integration)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  hero_section, is_active
) VALUES (
  '/services/ai-integration',
  'AI Integration Services',
  'service',
  'AI Integration Services - Add Intelligence to Your Apps | 404 Code Lab',
  'Professional AI integration services for websites and mobile apps. Add chatbots, content generation, image recognition, and more to your digital products.',
  'https://404codelab.com/services/ai-integration',
  'AI Integration Services - 404 Code Lab',
  'Transform your applications with cutting-edge AI capabilities. From chatbots to content generation and beyond.',
  'summary_large_image',
  '{"headline": "AI Integration Services", "subheadline": "Add intelligence to your applications", "badgeText": "AI Services", "ctaText": "Get Started", "ctaLink": "/dashboard/new-project"}'::jsonb,
  true
);

-- 8. Privacy Policy (/legal/privacy)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  no_index, is_active
) VALUES (
  '/legal/privacy',
  'Privacy Policy',
  'legal',
  'Privacy Policy - 404 Code Lab',
  'Read our privacy policy to understand how 404 Code Lab collects, uses, and protects your personal information.',
  'https://404codelab.com/legal/privacy',
  'Privacy Policy - 404 Code Lab',
  'Our commitment to protecting your privacy and personal data.',
  'summary',
  false,
  true
);

-- 9. Terms of Service (/legal/terms)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  no_index, is_active
) VALUES (
  '/legal/terms',
  'Terms of Service',
  'legal',
  'Terms of Service - 404 Code Lab',
  'Read the terms of service for using 404 Code Lab services. Understand your rights and obligations.',
  'https://404codelab.com/legal/terms',
  'Terms of Service - 404 Code Lab',
  'Terms and conditions for using our services.',
  'summary',
  false,
  true
);

-- 10. Refunds Policy (/legal/refunds)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  no_index, is_active
) VALUES (
  '/legal/refunds',
  'Refunds & Cancellations',
  'legal',
  'Refunds & Cancellations Policy - 404 Code Lab',
  'Learn about our refunds and cancellations policy. Understand your rights regarding refunds and service cancellations.',
  'https://404codelab.com/legal/refunds',
  'Refunds & Cancellations Policy - 404 Code Lab',
  'Our policy on refunds and cancellations.',
  'summary',
  false,
  true
);

-- 11. Cookie Policy (/legal/cookies)
INSERT INTO page_content (
  page_route, page_name, page_type, meta_title, meta_description,
  canonical_url, og_title, og_description, twitter_card_type,
  no_index, is_active
) VALUES (
  '/legal/cookies',
  'Cookie Policy',
  'legal',
  'Cookie Policy - 404 Code Lab',
  'Learn how 404 Code Lab uses cookies and similar technologies to enhance your browsing experience.',
  'https://404codelab.com/legal/cookies',
  'Cookie Policy - 404 Code Lab',
  'How we use cookies to improve your experience.',
  'summary',
  false,
  true
);
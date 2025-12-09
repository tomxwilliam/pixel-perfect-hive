-- Update Pro Care to remove SEO feature
UPDATE subscription_plans 
SET features = '["Weekly updates & backups", "3 hours of content edits per month", "Priority email support", "Image optimization & speed improvements", "Plugin & dependency health check"]'::jsonb,
description = 'For small businesses and creators needing faster updates and priority support.',
updated_at = now()
WHERE id = '56229b8b-b265-4915-8149-64cf11053ed6';
-- Update Enterprise Care to remove SEO feature
UPDATE subscription_plans 
SET features = '["Daily monitoring & automated backups", "Unlimited content updates", "Malware scanning & security hardening", "Priority response within 4 hours", "404 team access for design or structural edits", "E-commerce store management (product uploads, inventory)"]'::jsonb,
updated_at = now()
WHERE id = 'b6177458-bea0-4db7-b186-2ecdbfb6462d';
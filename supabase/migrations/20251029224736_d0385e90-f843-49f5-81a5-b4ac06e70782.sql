-- Update subscription plans with correct Stripe price IDs from live account
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SNhOGCyuPgWPpRLz5u8AWVk'
WHERE name = 'Basic Care' AND category = 'website_care';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SNhOUCyuPgWPpRLvYNba3Xu'
WHERE name = 'Pro Care' AND category = 'website_care';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SNhOiCyuPgWPpRLA7xfderN'
WHERE name = 'Enterprise Care' AND category = 'website_care';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SNhP0CyuPgWPpRL4sr8xwI4'
WHERE name = 'Essential Plan' AND category = 'it_support';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SNhPWCyuPgWPpRLMB7fE70o'
WHERE name = 'Elite Plan' AND category = 'it_support';
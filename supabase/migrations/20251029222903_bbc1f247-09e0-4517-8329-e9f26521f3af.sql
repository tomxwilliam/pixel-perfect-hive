-- Add Stripe columns to subscription_plans table
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly text;

-- Update with Stripe IDs from the screenshot
-- Website Care Plans
UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM6RXxweYohxE',
  stripe_price_id_monthly = 'price_1SNh0GCuyp9gWPpRLz5u8AWV'
WHERE name = 'Basic Care' AND category = 'website_care';

UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM6eZFTBSS7yK',
  stripe_price_id_monthly = 'price_1SNh0UCuyp9gWPpRLNgzVXXDi'
WHERE name = 'Pro Care' AND category = 'website_care';

UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM626wAKp7UVe',
  stripe_price_id_monthly = 'price_1SNh0iCuyp9gWPpRLA7xfd'
WHERE name = 'Enterprise Care' AND category = 'website_care';

-- IT Support Plans
UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM7gIGyVezjUM',
  stripe_price_id_monthly = 'price_1SNhP0Cuyp9gWPpRLEaO9XG1z'
WHERE name = 'Essential Plan' AND category = 'it_support';

UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM7edIyoXJNcF',
  stripe_price_id_monthly = 'price_1SNhPGCuyp9gWPpRLDAaBknmK'
WHERE name = 'Pro Plan' AND category = 'it_support';

UPDATE subscription_plans
SET 
  stripe_product_id = 'prod_TKM7SOx8huqqTe',
  stripe_price_id_monthly = 'price_1SNhPXCuyp9gWPpRLPbcRz2s'
WHERE name = 'Elite Plan' AND category = 'it_support';
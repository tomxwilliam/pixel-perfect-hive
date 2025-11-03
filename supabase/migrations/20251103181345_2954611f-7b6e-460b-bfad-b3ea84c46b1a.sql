-- Remove e-commerce from Optional Add-Ons for Enterprise Care plan
UPDATE subscription_plans 
SET add_ons = array_remove(add_ons, 'E-commerce store management (product uploads, inventory)')
WHERE id = 'b6177458-bea0-4db7-b186-2ecdbfb6462d'
AND name = 'Enterprise Care';
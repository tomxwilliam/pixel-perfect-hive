-- Add e-commerce feature to Enterprise Care plan
UPDATE subscription_plans 
SET features = features || jsonb_build_array('E-commerce store management (product uploads, inventory)')
WHERE id = 'b6177458-bea0-4db7-b186-2ecdbfb6462d'
AND name = 'Enterprise Care'
AND NOT features ? 'E-commerce store management (product uploads, inventory)';
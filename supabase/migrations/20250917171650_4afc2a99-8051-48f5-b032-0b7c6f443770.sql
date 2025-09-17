-- Standardize domain pricing TLD formats to use dots consistently
UPDATE domain_hosting_settings 
SET domain_pricing = jsonb_build_object(
  '.com', 12.99,
  '.co.uk', 9.99,
  '.org', 13.99,
  '.net', 14.99,
  '.uk', 9.99
) 
WHERE domain_pricing IS NOT NULL;
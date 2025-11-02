-- Remove hosting credentials feature completely
-- This addresses security finding: hosting_accts_no_encryption

-- Drop encryption/decryption functions
DROP FUNCTION IF EXISTS public.encrypt_hosting_credential(TEXT);
DROP FUNCTION IF EXISTS public.decrypt_hosting_credential(TEXT);
DROP FUNCTION IF EXISTS public.reset_hosting_password(UUID);

-- Remove cPanel credential columns from hosting_orders
ALTER TABLE hosting_orders 
  DROP COLUMN IF EXISTS cpanel_username,
  DROP COLUMN IF EXISTS cpanel_password_encrypted,
  DROP COLUMN IF EXISTS whm_account_id,
  DROP COLUMN IF EXISTS server_ip,
  DROP COLUMN IF EXISTS provisioned_at,
  DROP COLUMN IF EXISTS suspended_at;

-- Remove hosting-related columns from pending_domain_orders if they exist
ALTER TABLE pending_domain_orders
  DROP COLUMN IF EXISTS hosting_plan_id,
  DROP COLUMN IF EXISTS hosting_price;

-- Update domain_hosting_settings to disable hosting features
UPDATE domain_hosting_settings
SET 
  hosting_orders_enabled = false,
  auto_provisioning = false
WHERE hosting_orders_enabled = true OR auto_provisioning = true;

-- Add comment to hosting_orders explaining credential removal
COMMENT ON TABLE hosting_orders IS 
  'Hosting orders without credential storage. Credentials managed externally via WHM/cPanel admin interface.';

-- Clean up any remaining comments referencing removed functions
COMMENT ON TABLE hosting_orders IS 
  'Hosting subscription orders. Credentials are NOT stored - managed via external WHM panel only.';
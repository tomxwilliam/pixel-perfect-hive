-- Update hosting packages to match new customer portal structure

-- First, deactivate all existing packages
UPDATE hosting_packages SET is_active = false;

-- Delete existing packages and create new ones to match customer portal
DELETE FROM hosting_packages;

-- Insert new hosting packages matching customer portal
INSERT INTO hosting_packages (
  id,
  package_name,
  package_type,
  monthly_price,
  annual_price,
  disk_space_gb,
  bandwidth_gb,
  email_accounts,
  databases,
  subdomains,
  free_ssl,
  setup_fee,
  features,
  is_active
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Starter Plan',
    'starter',
    2.75, -- £33/year ÷ 12 months
    33.00,
    5,
    999999, -- Unlimited bandwidth represented as large number
    1,
    1,
    0, -- 1 website means 0 additional subdomains
    true,
    0.00,
    '{"websites": 1, "ssl": true, "domain": "free .co.uk", "backups": "weekly", "support": "UK-based"}',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Pro Plan',
    'business',
    5.50, -- £66/year ÷ 12 months
    66.00,
    20,
    999999, -- Unlimited bandwidth
    5,
    3,
    2, -- 3 websites means 2 additional subdomains
    true,
    0.00,
    '{"websites": 3, "ssl": true, "domain": "free .co.uk", "backups": "daily", "support": "priority UK"}',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Elite Plan',
    'professional',
    8.25, -- £99/year ÷ 12 months
    99.00,
    50,
    999999, -- Unlimited bandwidth
    999999, -- Unlimited emails represented as large number
    999999, -- Unlimited databases
    999999, -- Unlimited websites/subdomains
    true,
    0.00,
    '{"websites": "unlimited", "ssl": true, "domain": "free .co.uk", "backups": "daily", "support": "priority UK", "security": "enhanced", "performance": "enhanced"}',
    true
  );
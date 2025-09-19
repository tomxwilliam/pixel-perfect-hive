-- Add a test user for accounts@404codelab.com
INSERT INTO profiles (id, email, role, first_name, last_name, company_name, phone, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'accounts@404codelab.com',
  'customer',
  'Accounts',
  'Department',
  '404 Code Lab',
  NULL,
  NOW(),
  NOW()
);
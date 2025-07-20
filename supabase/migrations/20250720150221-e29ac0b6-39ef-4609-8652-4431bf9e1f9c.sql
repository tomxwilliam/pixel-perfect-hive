-- Create foreign key relationship between admin_requests and profiles
ALTER TABLE admin_requests 
ADD CONSTRAINT admin_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
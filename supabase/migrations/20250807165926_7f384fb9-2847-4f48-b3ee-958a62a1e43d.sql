-- Fix foreign key constraints to enable cascade deletions

-- Add foreign key constraints with CASCADE DELETE for related tables
-- This will ensure when a customer is deleted, their related records are also deleted

-- First, let's add foreign key constraints where they're missing with CASCADE DELETE

-- Add foreign key for quotes -> profiles (customers)
ALTER TABLE quotes 
ADD CONSTRAINT quotes_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for quotes -> projects  
ALTER TABLE quotes 
ADD CONSTRAINT quotes_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Add foreign key for invoices -> profiles (customers)
ALTER TABLE invoices 
ADD CONSTRAINT invoices_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for invoices -> projects
ALTER TABLE invoices 
ADD CONSTRAINT invoices_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Add foreign key for projects -> profiles (customers)
ALTER TABLE projects 
ADD CONSTRAINT projects_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for tickets -> profiles (customers)
ALTER TABLE tickets 
ADD CONSTRAINT tickets_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for tickets -> projects
ALTER TABLE tickets 
ADD CONSTRAINT tickets_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Add foreign key for call_bookings -> profiles (customers)
ALTER TABLE call_bookings 
ADD CONSTRAINT call_bookings_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for messages -> profiles (sender)
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for messages -> profiles (recipient)
ALTER TABLE messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for notifications -> profiles (user)
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for file_uploads -> profiles (user)
ALTER TABLE file_uploads 
ADD CONSTRAINT file_uploads_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for domains -> profiles (customer)
ALTER TABLE domains 
ADD CONSTRAINT domains_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key for hosting_subscriptions -> profiles (customer)
ALTER TABLE hosting_subscriptions 
ADD CONSTRAINT hosting_subscriptions_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE;
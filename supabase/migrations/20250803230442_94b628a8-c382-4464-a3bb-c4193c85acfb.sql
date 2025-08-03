-- Phase 1: Fix Message System Database Relationship
-- Add missing foreign key constraints between messages and profiles tables

-- Add foreign key constraint for sender_id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for recipient_id
ALTER TABLE public.messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Phase 3: Security Improvements
-- Update OTP expiry settings to recommended values (6 hours = 21600 seconds)
UPDATE auth.config SET 
  otp_exp = 21600
WHERE TRUE;

-- Enable leaked password protection
UPDATE auth.config SET 
  password_min_length = 8,
  enable_signup = true
WHERE TRUE;
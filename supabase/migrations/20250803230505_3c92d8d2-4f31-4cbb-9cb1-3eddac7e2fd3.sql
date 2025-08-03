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
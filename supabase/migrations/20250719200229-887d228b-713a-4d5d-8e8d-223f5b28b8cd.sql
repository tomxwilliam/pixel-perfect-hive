-- Create notifications table for real-time admin-customer communication
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  category TEXT NOT NULL DEFAULT 'general', -- 'project', 'ticket', 'invoice', 'quote', 'general'
  related_id UUID, -- ID of related project, ticket, invoice, etc.
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID, -- Admin who created the notification
  action_url TEXT -- Optional URL for the notification action
);

-- Create messages table for direct admin-customer communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'message', -- 'message', 'update', 'announcement'
  related_type TEXT, -- 'project', 'ticket', 'invoice', 'quote'
  related_id UUID, -- ID of related item
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_log table for tracking all customer interactions
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Customer this activity relates to
  actor_id UUID, -- Who performed the action (admin or customer)
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed', etc.
  entity_type TEXT NOT NULL, -- 'project', 'ticket', 'invoice', 'quote', 'message'
  entity_id UUID NOT NULL,
  old_values JSONB, -- Previous values for updates
  new_values JSONB, -- New values for updates
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications for customers" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages policies
CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages to admins" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can send messages to customers" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can update their received messages" 
ON public.messages 
FOR UPDATE 
USING (recipient_id = auth.uid());

-- Activity log policies
CREATE POLICY "Users can view their own activity" 
ON public.activity_log 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" 
ON public.activity_log 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert activity logs" 
ON public.activity_log 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_read ON public.messages(read);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);

-- Create function to automatically create activity logs
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_description TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.activity_log (
    user_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    description
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_description
  );
END;
$$;

-- Create function to send notification to user
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_category TEXT DEFAULT 'general',
  p_related_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    related_id,
    created_by,
    action_url
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_related_id,
    p_created_by,
    p_action_url
  );
END;
$$;
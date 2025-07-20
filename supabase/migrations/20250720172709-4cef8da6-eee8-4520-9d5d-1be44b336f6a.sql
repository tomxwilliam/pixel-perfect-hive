
-- Phase 1: Critical Security Fixes - Update database functions with secure search_path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN new.email LIKE '%@404codelab.com' THEN 'admin'::public.user_role
      ELSE 'customer'::public.user_role
    END
  );
  RETURN new;
END;
$$;

-- Fix log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_description text,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

-- Fix send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_category text DEFAULT 'general',
  p_related_id uuid DEFAULT NULL,
  p_created_by uuid DEFAULT NULL,
  p_action_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Add strategic performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON public.admin_requests(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id_status ON public.projects(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id_status ON public.tickets(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id_status ON public.invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for ON public.social_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id_read ON public.messages(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id_created_at ON public.activity_log(user_id, created_at DESC);

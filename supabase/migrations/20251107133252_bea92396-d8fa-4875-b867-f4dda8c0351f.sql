-- Fix security warnings by setting search_path for all trigger functions

-- Update send_email_notification function
CREATE OR REPLACE FUNCTION send_email_notification(
  p_event_type TEXT,
  p_entity_id UUID,
  p_entity_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://ucsxwhnscgbcshaghyrq.supabase.co/functions/v1/send-notification-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'event_type', p_event_type,
        'entity_id', p_entity_id,
        'entity_type', p_entity_type
      )
    );
END;
$$;

-- Update notify_project_created function
CREATE OR REPLACE FUNCTION notify_project_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.approval_status = 'pending' AND OLD.approval_status IS NULL THEN
    PERFORM send_email_notification('project_request_submitted', NEW.id, 'project');
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_project_status_change function
CREATE OR REPLACE FUNCTION notify_project_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.approval_status != OLD.approval_status THEN
    IF NEW.approval_status = 'approved' THEN
      PERFORM send_email_notification('project_approved', NEW.id, 'project');
    ELSIF NEW.approval_status = 'rejected' THEN
      PERFORM send_email_notification('project_rejected', NEW.id, 'project');
    ELSIF NEW.approval_status = 'revision_requested' THEN
      PERFORM send_email_notification('project_revision_requested', NEW.id, 'project');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_ticket_created function
CREATE OR REPLACE FUNCTION notify_ticket_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM send_email_notification('ticket_created', NEW.id, 'ticket');
  RETURN NEW;
END;
$$;

-- Update notify_invoice_created function
CREATE OR REPLACE FUNCTION notify_invoice_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM send_email_notification('invoice_created', NEW.id, 'invoice');
  RETURN NEW;
END;
$$;

-- Update notify_invoice_paid function
CREATE OR REPLACE FUNCTION notify_invoice_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    PERFORM send_email_notification('invoice_paid', NEW.id, 'invoice');
  ELSIF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
    PERFORM send_email_notification('invoice_overdue', NEW.id, 'invoice');
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_quote_created function
CREATE OR REPLACE FUNCTION notify_quote_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM send_email_notification('quote_created', NEW.id, 'quote');
  RETURN NEW;
END;
$$;

-- Update notify_quote_status_change function
CREATE OR REPLACE FUNCTION notify_quote_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    IF NEW.status = 'accepted' THEN
      PERFORM send_email_notification('quote_accepted', NEW.id, 'quote');
    ELSIF NEW.status = 'rejected' THEN
      PERFORM send_email_notification('quote_rejected', NEW.id, 'quote');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_subscription_change function
CREATE OR REPLACE FUNCTION notify_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM send_email_notification('subscription_created', NEW.id, 'subscription');
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      PERFORM send_email_notification('subscription_cancelled', NEW.id, 'subscription');
    ELSIF NEW.status = 'active' AND OLD.status = 'cancelled' THEN
      PERFORM send_email_notification('subscription_renewed', NEW.id, 'subscription');
    ELSIF NEW.status = 'past_due' AND OLD.status != 'past_due' THEN
      PERFORM send_email_notification('subscription_payment_failed', NEW.id, 'subscription');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_appointment_change function
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM send_email_notification('appointment_created', NEW.id, 'appointment');
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      PERFORM send_email_notification('appointment_cancelled', NEW.id, 'appointment');
    ELSIF (NEW.call_date != OLD.call_date OR NEW.call_time != OLD.call_time) THEN
      PERFORM send_email_notification('appointment_updated', NEW.id, 'appointment');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
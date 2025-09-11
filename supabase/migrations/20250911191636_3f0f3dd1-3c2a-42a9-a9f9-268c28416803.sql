-- Fix remaining functions missing search_path

CREATE OR REPLACE FUNCTION public.log_activity(p_user_id uuid, p_actor_id uuid, p_action text, p_entity_type text, p_entity_id uuid, p_description text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.calculate_project_completion_enhanced(project_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    completion_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM project_tasks
    WHERE project_id = project_id_param AND parent_task_id IS NULL;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM project_tasks
    WHERE project_id = project_id_param 
    AND parent_task_id IS NULL 
    AND status = 'completed';
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    completion_percentage := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    
    UPDATE projects 
    SET completion_percentage = completion_percentage,
        actual_hours = (
            SELECT COALESCE(SUM(actual_hours), 0) 
            FROM project_tasks 
            WHERE project_tasks.project_id = project_id_param
        )
    WHERE id = project_id_param;
    
    RETURN completion_percentage;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_project_completion(project_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    total_tasks integer;
    completed_tasks integer;
    completion_percentage integer;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM project_tasks
    WHERE project_id = project_id_param;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM project_tasks
    WHERE project_id = project_id_param AND status = 'completed';
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    completion_percentage := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    
    UPDATE projects 
    SET completion_percentage = completion_percentage,
        total_hours_logged = (
            SELECT COALESCE(SUM(hours_logged), 0) 
            FROM project_time_logs 
            WHERE project_time_logs.project_id = project_id_param
        ),
        total_cost = (
            SELECT COALESCE(SUM(total_cost), 0) 
            FROM project_time_logs 
            WHERE project_time_logs.project_id = project_id_param AND is_billable = true
        )
    WHERE id = project_id_param;
    
    RETURN completion_percentage;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_project_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    PERFORM public.calculate_project_completion(NEW.project_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_lead_last_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.leads 
  SET last_activity_at = now()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := (SELECT COALESCE(MAX(ticket_number), 0) + 1 FROM tickets);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_ticket_due_date()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NEW.due_date IS NULL THEN
    SELECT 
      CASE 
        WHEN tc.sla_hours IS NOT NULL THEN NEW.created_at + (tc.sla_hours || ' hours')::INTERVAL
        ELSE NEW.created_at + '24 hours'::INTERVAL
      END INTO NEW.due_date
    FROM ticket_categories tc
    WHERE tc.id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$;
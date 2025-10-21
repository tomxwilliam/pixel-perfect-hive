-- Fix approve_project function to use correct enum values and type casting
CREATE OR REPLACE FUNCTION public.approve_project(
  project_id_param uuid,
  approval_decision text,
  approval_notes_param text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  project_record projects;
  customer_user_id UUID;
BEGIN
  -- Get project details
  SELECT * INTO project_record FROM projects WHERE id = project_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;
  
  -- Update project approval status and set proper status with correct enum casting
  UPDATE projects 
  SET 
    approval_status = approval_decision,
    approved_by = auth.uid(),
    approved_at = CASE WHEN approval_decision = 'approved' THEN NOW() ELSE NULL END,
    approval_notes = approval_notes_param,
    status = CASE 
      WHEN approval_decision = 'approved' THEN 'in_progress'::project_status
      WHEN approval_decision = 'rejected' THEN 'cancelled'::project_status
      ELSE 'pending'::project_status
    END,
    updated_at = NOW()
  WHERE id = project_id_param;
  
  -- If approved, create default tasks
  IF approval_decision = 'approved' THEN
    PERFORM create_default_project_tasks(project_id_param, project_record.project_type);
    
    -- Add customer to project team
    INSERT INTO project_team_members (
      project_id,
      user_id,
      role,
      added_by,
      can_log_time,
      can_edit_tasks,
      can_view_budget
    ) VALUES (
      project_id_param,
      project_record.customer_id,
      'client',
      auth.uid(),
      false,
      false,
      true
    ) ON CONFLICT (project_id, user_id) DO NOTHING;
  END IF;
  
  -- Update approval record if exists
  UPDATE project_approvals 
  SET 
    status = approval_decision,
    responded_at = NOW(),
    comments = approval_notes_param
  WHERE project_id = project_id_param AND approval_type = 'project_creation';
  
  -- Send notification to customer
  SELECT customer_id INTO customer_user_id FROM projects WHERE id = project_id_param;
  
  PERFORM send_notification(
    customer_user_id,
    CASE 
      WHEN approval_decision = 'approved' THEN 'Project Approved!'
      WHEN approval_decision = 'rejected' THEN 'Project Update Required'
      ELSE 'Project Status Update'
    END,
    CASE 
      WHEN approval_decision = 'approved' THEN 'Your project "' || project_record.title || '" has been approved and work will begin shortly. You can now track progress in your project dashboard.'
      WHEN approval_decision = 'rejected' THEN 'Your project "' || project_record.title || '" requires revision. Please check the details and resubmit.'
      ELSE 'Your project "' || project_record.title || '" status has been updated to revision requested.'
    END,
    CASE 
      WHEN approval_decision = 'approved' THEN 'success'
      WHEN approval_decision = 'rejected' THEN 'error'
      ELSE 'warning'
    END,
    'project_approval',
    project_id_param,
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;
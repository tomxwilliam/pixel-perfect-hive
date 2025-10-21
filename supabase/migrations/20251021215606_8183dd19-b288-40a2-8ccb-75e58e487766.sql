-- Fix create_default_project_tasks function to use correct column name (sort_order instead of order_sequence)
CREATE OR REPLACE FUNCTION public.create_default_project_tasks(
  project_id_param uuid,
  project_type_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert default tasks based on project type
  INSERT INTO project_tasks (
    project_id,
    title,
    description,
    priority,
    status,
    estimated_hours,
    created_by,
    sort_order,
    is_milestone
  )
  SELECT 
    project_id_param,
    task_title,
    task_description,
    task_priority,
    task_status,
    estimated_hours,
    (SELECT id FROM auth.users WHERE email LIKE '%@404codelab.com' LIMIT 1),
    order_sequence,
    is_milestone
  FROM project_task_templates
  WHERE project_type = project_type_param
  ORDER BY order_sequence;
  
  -- Calculate project completion after adding tasks
  PERFORM calculate_project_completion_enhanced(project_id_param);
END;
$$;
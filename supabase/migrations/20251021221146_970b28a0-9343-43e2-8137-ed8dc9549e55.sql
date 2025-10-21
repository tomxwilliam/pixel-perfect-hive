-- Fix calculate_project_completion function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.calculate_project_completion(project_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    total_tasks integer;
    completed_tasks integer;
    calculated_percentage integer;  -- Renamed from completion_percentage to avoid ambiguity
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
    
    calculated_percentage := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    
    UPDATE projects 
    SET completion_percentage = calculated_percentage,
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
    
    RETURN calculated_percentage;
END;
$$;
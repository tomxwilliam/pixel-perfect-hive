-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.calculate_project_completion_enhanced(project_id_param UUID)
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
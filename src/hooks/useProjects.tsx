import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  completion_percentage: number;
  customer_id: string;
  budget?: number;
  actual_hours?: number;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
  project_type: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let projectsQuery = supabase.from('projects').select('*');
      
      // Filter based on user role
      if (profile?.role !== 'admin') {
        projectsQuery = projectsQuery.eq('customer_id', user.id);
      }

      const { data: projectsData, error: projectsError } = await projectsQuery
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      setProjects(projectsData || []);

      // Fetch tasks for all projects
      const projectIds = projectsData?.map(p => p.id) || [];
      if (projectIds.length > 0) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('project_tasks')
          .select('*')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
      }

    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          customer_id: user.id,
          project_type: projectData.project_type || 'web',
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      fetchProjects(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      fetchProjects(); // Refresh data
    } catch (err) {
      console.error('Error updating project:', err);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
          project_id: taskData.project_id || '',
          title: taskData.title || 'Untitled Task',
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      fetchProjects(); // Refresh data
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      fetchProjects(); // Refresh data
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();

    // Set up real-time subscriptions
    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchProjects()
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_tasks' },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [user?.id, profile?.role]);

  return {
    projects,
    tasks,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    createTask,
    updateTask,
  };
};
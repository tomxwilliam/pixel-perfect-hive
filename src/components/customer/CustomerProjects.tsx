
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen, Calendar, DollarSign } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

export const CustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Real-time subscription
    const channel = supabase
      .channel('customer-projects')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `customer_id=eq.${user?.id}` },
        () => fetchProjects()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'completed': return 100;
      case 'in_progress': return 60;
      case 'pending': return 10;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Loading your projects...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Your Projects
        </CardTitle>
        <CardDescription>
          Track the progress of your development projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(project.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(project.status)} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Started: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  {project.budget && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Budget: £{Number(project.budget).toLocaleString()}
                    </div>
                  )}
                </div>
                
                {project.estimated_completion_date && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Expected completion: {new Date(project.estimated_completion_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MoreHorizontal, Clock, Users, AlertTriangle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ProjectWithDetails extends Tables<'projects'> {
  customer: {
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
  } | null;
  project_manager: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  tasks_count: number;
  active_tasks: number;
  overdue_tasks: number;
  team_members_count: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface ProjectKanbanBoardProps {
  projects: ProjectWithDetails[];
  onProjectUpdate: () => void;
}

const STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { id: 'completed', label: 'Completed', color: 'bg-green-100 dark:bg-green-900' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900' }
];

export const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  projects,
  onProjectUpdate
}) => {
  const [draggedProject, setDraggedProject] = useState<ProjectWithDetails | null>(null);

  const handleDragStart = (project: ProjectWithDetails) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedProject.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project status updated successfully",
      });

      onProjectUpdate();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      });
    }

    setDraggedProject(null);
  };

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">Project Kanban Board</div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[600px]">
        {STATUSES.map(status => (
          <div
            key={status.id}
            className={`space-y-3 p-4 rounded-lg ${status.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{status.label}</h3>
              <Badge variant="secondary">
                {getProjectsByStatus(status.id).length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {getProjectsByStatus(status.id).map(project => (
                <Card
                  key={project.id}
                  className={`cursor-move hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(project.priority || 'medium')}`}
                  draggable
                  onDragStart={() => handleDragStart(project)}
                >
                  <CardContent className="p-3 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">{project.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{project.completion_percentage || 0}%</span>
                      </div>
                      <Progress value={project.completion_percentage || 0} className="h-1" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{project.tasks_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{project.team_members_count}</span>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 ${getRiskColor(project.risk_level)}`}>
                        <AlertTriangle className="h-3 w-3" />
                        <span className="capitalize">{project.risk_level}</span>
                      </div>
                    </div>

                    {/* Client */}
                    <div className="text-xs text-muted-foreground">
                      {project.customer?.company_name || 
                        `${project.customer?.first_name || ''} ${project.customer?.last_name || ''}`.trim()}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
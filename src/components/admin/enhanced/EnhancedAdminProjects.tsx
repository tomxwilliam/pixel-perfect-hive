import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Plus, Filter, Calendar, Users, Clock, 
  TrendingUp, AlertTriangle, CheckCircle, MoreHorizontal,
  Eye, Edit, Trash2, PlayCircle, PauseCircle, 
  BarChart3, Calendar as CalendarIcon, Kanban,
  FileText, MessageSquare, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { ProjectTimeLogModal } from "../modals/ProjectTimeLogModal";
import { ProjectKanbanBoard } from "./ProjectKanbanBoard";
import { ProjectCalendarView } from "./ProjectCalendarView";
import { ProjectAnalytics } from "./ProjectAnalytics";

// Enhanced types based on Supabase schema
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
  recent_activity: string | null;
  risk_level: 'low' | 'medium' | 'high';
  next_milestone: string | null;
}

export const EnhancedAdminProjects = () => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "kanban" | "calendar" | "analytics">("cards");
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [timeLogModalOpen, setTimeLogModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          customer:profiles!projects_customer_id_fkey(first_name, last_name, company_name),
          project_manager:profiles!projects_project_manager_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each project
      const enhancedProjects = await Promise.all(
        (data || []).map(async (project) => {
          const [tasksResult, teamResult] = await Promise.all([
            supabase
              .from('project_tasks')
              .select('id, status, due_date')
              .eq('project_id', project.id),
            supabase
              .from('project_team_members')
              .select('id')
              .eq('project_id', project.id)
              .is('left_at', null)
          ]);

          const tasks = tasksResult.data || [];
          const activeTasks = tasks.filter(t => t.status !== 'completed').length;
          const overdueTasks = tasks.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
          ).length;

          return {
            ...project,
            tasks_count: tasks.length,
            active_tasks: activeTasks,
            overdue_tasks: overdueTasks,
            team_members_count: teamResult.data?.length || 0,
            recent_activity: null,
            risk_level: (overdueTasks > 2 ? 'high' : overdueTasks > 0 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
            next_milestone: null
          };
        })
      );

      setProjects(enhancedProjects as unknown as ProjectWithDetails[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400';
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse h-64 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Project Management</h2>
          <p className="text-muted-foreground">Comprehensive project oversight and management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.risk_level === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(project.priority || 'medium')}>
                      {project.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.completion_percentage || 0}%</span>
                    </div>
                    <Progress value={project.completion_percentage || 0} className="h-2" />
                  </div>

                  {/* Status and Risk */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                      <span className="text-sm capitalize">{project.status.replace('_', ' ')}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getRiskColor(project.risk_level)}`}>
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs capitalize">{project.risk_level} risk</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{project.tasks_count}</div>
                      <div className="text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{project.team_members_count}</div>
                      <div className="text-muted-foreground">Team</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{project.overdue_tasks}</div>
                      <div className="text-muted-foreground">Overdue</div>
                    </div>
                  </div>

                  {/* Customer & Manager */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{project.customer?.company_name || 
                        `${project.customer?.first_name || ''} ${project.customer?.last_name || ''}`.trim()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manager:</span>
                      <span>{`${project.project_manager?.first_name || ''} ${project.project_manager?.last_name || ''}`.trim()}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  {project.deadline && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={new Date(project.deadline) < new Date() ? 'text-red-600' : ''}>
                        {format(new Date(project.deadline), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setTimeLogModalOpen(true);
                      }}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Log Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <ProjectKanbanBoard projects={filteredProjects} onProjectUpdate={fetchProjects} />
        </TabsContent>

        <TabsContent value="calendar">
          <ProjectCalendarView projects={filteredProjects} />
        </TabsContent>

        <TabsContent value="analytics">
          <ProjectAnalytics projects={filteredProjects} />
        </TabsContent>
      </Tabs>

      {/* Time Log Modal */}
      {selectedProject && (
        <ProjectTimeLogModal
          open={timeLogModalOpen}
          onOpenChange={setTimeLogModalOpen}
          projectId={selectedProject.id}
          onTimeLogged={() => {
            fetchProjects();
            setTimeLogModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
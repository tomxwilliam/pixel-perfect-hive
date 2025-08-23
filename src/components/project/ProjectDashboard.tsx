import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  BarChart3, 
  MessageSquare,
  FileText,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress?: number;
  customer_id: string;
  start_date?: string;
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueProjects: number;
  avgProgress: number;
}

const ProjectDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueProjects: 0,
    avgProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks(id, status, completed_at),
          project_team_members(user_id)
        `);

      if (error) throw error;

      setProjects(projectsData || []);
      calculateStats(projectsData || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: any[]) => {
    const now = new Date();
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    
    let totalTasks = 0;
    let completedTasks = 0;
    let totalProgress = 0;
    let overdueProjects = 0;

    projectsData.forEach(project => {
      if (project.project_tasks) {
        totalTasks += project.project_tasks.length;
        completedTasks += project.project_tasks.filter((t: any) => t.status === 'completed').length;
      }
      
      if (project.completion_percentage) {
        totalProgress += project.completion_percentage;
      }

      if (project.deadline && new Date(project.deadline) < now && project.status !== 'completed') {
        overdueProjects++;
      }
    });

    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueProjects,
      avgProgress: totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const isProjectOverdue = (deadline: string, status: string) => {
    return new Date(deadline) < new Date() && status !== 'completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your projects, tasks, and team collaboration
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Project creation form will be implemented here</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdueProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <MobileTabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <MobileTabsList className="grid w-full grid-cols-4">
          <MobileTabsTrigger value="overview">Overview</MobileTabsTrigger>
          <MobileTabsTrigger value="kanban">Kanban</MobileTabsTrigger>
          <MobileTabsTrigger value="calendar">Calendar</MobileTabsTrigger>
          <MobileTabsTrigger value="reports">Reports</MobileTabsTrigger>
        </MobileTabsList>

        <MobileTabsContent value="overview" className="space-y-6">
          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)} ml-2 mt-1`} />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>

                  {/* Deadline */}
                  {project.deadline && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due Date</span>
                      </div>
                      <span className={isProjectOverdue(project.deadline, project.status) ? 'text-red-600' : ''}>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Time Tracking */}
                  {(project.estimated_hours || project.actual_hours) && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Hours</span>
                      </div>
                      <span>
                        {project.actual_hours || 0}h / {project.estimated_hours || 0}h
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <Badge variant="outline">
                      {project.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first project
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Your First Project</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">Project creation form will be implemented here</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </MobileTabsContent>

        <MobileTabsContent value="kanban">
          <KanbanBoard />
        </MobileTabsContent>

        <MobileTabsContent value="calendar">
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4">
                View project deadlines, milestones, and meetings in calendar format
              </p>
              <Button>Open Calendar View</Button>
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="reports">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Project Reports</h3>
              <p className="text-muted-foreground mb-4">
                Generate detailed reports on project progress, team productivity, and timelines
              </p>
              <Button>View Reports</Button>
            </CardContent>
          </Card>
        </MobileTabsContent>
      </MobileTabs>
    </div>
  );
};

export default ProjectDashboard;
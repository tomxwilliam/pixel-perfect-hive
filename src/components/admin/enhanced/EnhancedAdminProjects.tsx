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

// Enhanced types
interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  health_status: string;
  completion_percentage: number;
  budget: number;
  total_cost: number;
  total_hours_logged: number;
  start_date: string;
  deadline: string;
  customer_id: string;
  project_manager_id: string;
  created_at: string;
  updated_at: string;
  customer: {
    first_name: string;
    last_name: string;
    company_name: string;
  };
  project_manager: {
    first_name: string;
    last_name: string;
  };
  tasks_count: number;
  active_tasks: number;
  overdue_tasks: number;
  team_members_count: number;
}

interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  total_revenue: number;
  total_hours: number;
}

const EnhancedAdminProjects = () => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [stats, setStats] = useState<ProjectStats>({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    overdue_projects: 0,
    total_revenue: 0,
    total_hours: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [currentView, setCurrentView] = useState("list");

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customer:profiles!projects_customer_id_fkey(first_name, last_name, company_name),
          project_manager:profiles!projects_project_manager_id_fkey(first_name, last_name)
        `)
        .single()
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each project
      const enhancedProjects = await Promise.all(
        data.map(async (project) => {
          // Get task counts
          const { data: tasks } = await supabase
            .from('project_tasks')
            .select('id, status, due_date')
            .eq('project_id', project.id);

          // Get team member count
          const { data: teamMembers } = await supabase
            .from('project_team_members')
            .select('id')
            .eq('project_id', project.id)
            .is('left_at', null);

          const tasksCount = tasks?.length || 0;
          const activeTasks = tasks?.filter(t => ['todo', 'in_progress'].includes(t.status)).length || 0;
          const overdueTasks = tasks?.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
          ).length || 0;

          return {
            ...project,
            tasks_count: tasksCount,
            active_tasks: activeTasks,
            overdue_tasks: overdueTasks,
            team_members_count: teamMembers?.length || 0
          };
        })
      );

      setProjects(enhancedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('status, total_cost, total_hours_logged, deadline');

      if (error) throw error;

      const now = new Date();
      const stats = projectsData.reduce((acc, project) => {
        acc.total_projects++;
        
        if (['in_progress', 'pending'].includes(project.status)) {
          acc.active_projects++;
        }
        
        if (project.status === 'completed') {
          acc.completed_projects++;
        }
        
        if (project.deadline && new Date(project.deadline) < now && project.status !== 'completed') {
          acc.overdue_projects++;
        }
        
        acc.total_revenue += project.total_cost || 0;
        acc.total_hours += project.total_hours_logged || 0;
        
        return acc;
      }, {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        overdue_projects: 0,
        total_revenue: 0,
        total_hours: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'red': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
    const matchesHealth = healthFilter === "all" || project.health_status === healthFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesHealth;
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-300`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }: { project: ProjectWithDetails }) => (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground line-clamp-1">
              {project.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {project.customer?.company_name || `${project.customer?.first_name} ${project.customer?.last_name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getHealthColor(project.health_status)}>
              {project.health_status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground">{project.completion_percentage}%</span>
            </div>
            <Progress value={project.completion_percentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{project.active_tasks} active tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{project.team_members_count} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{project.total_hours_logged}h logged</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">£{project.total_cost?.toLocaleString() || 0}</span>
            </div>
          </div>

          {project.overdue_tasks > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{project.overdue_tasks} overdue tasks</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {project.deadline ? `Due ${format(new Date(project.deadline), 'MMM dd')}` : 'No deadline'}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.total_projects}
          subtitle="All time"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={stats.active_projects}
          subtitle="In progress"
          icon={PlayCircle}
          color="green"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue_projects}
          subtitle="Past deadline"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Total Revenue"
          value={`£${stats.total_revenue.toLocaleString()}`}
          subtitle={`${stats.total_hours.toLocaleString()} hours`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-foreground">Enhanced Project Management</CardTitle>
              <p className="text-muted-foreground">Comprehensive project oversight and management</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentView} onValueChange={setCurrentView} className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={healthFilter} onValueChange={setHealthFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Health</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="list" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or create a new project.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <div className="text-center py-12">
                <Kanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Kanban Board</h3>
                <p className="text-muted-foreground">Kanban board view coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Calendar View</h3>
                <p className="text-muted-foreground">Calendar view coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Advanced analytics coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAdminProjects;
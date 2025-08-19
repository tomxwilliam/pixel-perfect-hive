import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, MessageSquare, FileText, Calendar, 
  Clock, TrendingUp, CheckCircle, AlertTriangle,
  Eye, Download, Plus, Filter, Users, Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ProjectRequestForm } from '../ProjectRequestForm';

interface EnhancedProject {
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
  created_at: string;
  updated_at: string;
  project_manager: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  recent_comments: ProjectComment[];
  team_members: TeamMember[];
  change_requests: ChangeRequest[];
}

interface ProjectTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  completion_percentage: number;
}

interface ProjectMilestone {
  id: string;
  title: string;
  due_date: string;
  status: string;
  completion_percentage: number;
  is_critical: boolean;
}

interface ProjectComment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  is_internal: boolean;
  author: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface TeamMember {
  id: string;
  role: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface ChangeRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  requested_at: string;
  estimated_cost: number;
}

const EnhancedCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
          project_manager:profiles!projects_project_manager_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each project
      const enhancedProjects = await Promise.all(
        projectsData.map(async (project) => {
          // Get tasks
          const { data: tasks } = await supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(5);

          // Get milestones
          const { data: milestones } = await supabase
            .from('project_milestones')
            .select('*')
            .eq('project_id', project.id)
            .order('due_date', { ascending: true });

          // Get recent comments (non-internal only)
          const { data: comments } = await supabase
            .from('project_comments')
            .select(`
              *,
              author:profiles!project_comments_author_id_fkey(first_name, last_name, avatar_url)
            `)
            .eq('project_id', project.id)
            .eq('is_internal', false)
            .order('created_at', { ascending: false })
            .limit(3);

          // Get team members
          const { data: teamMembers } = await supabase
            .from('project_team_members')
            .select(`
              *,
              user:profiles!project_team_members_user_id_fkey(first_name, last_name, avatar_url)
            `)
            .eq('project_id', project.id)
            .is('left_at', null);

          // Get change requests
          const { data: changeRequests } = await supabase
            .from('project_change_requests')
            .select('*')
            .eq('project_id', project.id)
            .order('requested_at', { ascending: false });

          return {
            ...project,
            tasks: tasks || [],
            milestones: milestones || [],
            recent_comments: comments || [],
            team_members: teamMembers || [],
            change_requests: changeRequests || []
          };
        })
      );

      setProjects(enhancedProjects as any);
      if (enhancedProjects.length > 0 && !selectedProject) {
        setSelectedProject(enhancedProjects[0] as any);
      }
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
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">My Projects</h2>
          <p className="text-muted-foreground">
            Track the progress of your development projects with enhanced features
          </p>
        </div>
        <Card className="bg-card border-border text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any projects assigned to you yet.
            </p>
            <ProjectRequestForm onProjectRequested={fetchProjects} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">My Projects</h2>
        <p className="text-muted-foreground">
          Track progress, collaborate with your team, and manage project deliverables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Projects</CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {project.title}
                        </h4>
                        <Badge className={getHealthColor(project.health_status)} variant="secondary">
                          {project.health_status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(project.status)} variant="secondary">
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.completion_percentage}%
                        </span>
                      </div>
                      <Progress value={project.completion_percentage} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Project Details */}
        <div className="lg:col-span-3">
          {selectedProject && (
            <Tabs defaultValue="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Team
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Change
                  </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Header */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-foreground">
                          {selectedProject.title}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {selectedProject.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(selectedProject.status)}>
                            {selectedProject.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(selectedProject.priority)}>
                            {selectedProject.priority}
                          </Badge>
                          <Badge className={getHealthColor(selectedProject.health_status)}>
                            Health: {selectedProject.health_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-foreground">
                          {selectedProject.completion_percentage}%
                        </div>
                        <p className="text-sm text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={selectedProject.completion_percentage} className="h-3 mb-4" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {selectedProject.tasks.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Tasks</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {selectedProject.milestones.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Milestones</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {selectedProject.total_hours_logged}h
                        </div>
                        <p className="text-sm text-muted-foreground">Hours Logged</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          £{selectedProject.total_cost?.toLocaleString() || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Current Cost</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Timeline */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="text-foreground">
                          {selectedProject.start_date 
                            ? format(new Date(selectedProject.start_date), 'MMM dd, yyyy')
                            : 'Not set'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline</span>
                        <span className="text-foreground">
                          {selectedProject.deadline 
                            ? format(new Date(selectedProject.deadline), 'MMM dd, yyyy')
                            : 'Not set'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="text-foreground font-medium">
                          £{selectedProject.budget?.toLocaleString() || 'Not set'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Team Members */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedProject.project_manager && (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedProject.project_manager.avatar_url} />
                              <AvatarFallback>
                                {selectedProject.project_manager.first_name?.[0]}{selectedProject.project_manager.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {selectedProject.project_manager.first_name} {selectedProject.project_manager.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">Project Manager</p>
                            </div>
                          </div>
                        )}
                        {selectedProject.team_members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user.avatar_url} />
                              <AvatarFallback>
                                {member.user.first_name?.[0]}{member.user.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {member.user.first_name} {member.user.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {member.role}
                              </p>
                            </div>
                          </div>
                        ))}
                        {selectedProject.team_members.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{selectedProject.team_members.length - 3} more members
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProject.recent_comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar_url} />
                            <AvatarFallback>
                              {comment.author.first_name?.[0]}{comment.author.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">
                                {comment.author.first_name} {comment.author.last_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(comment.created_at), 'MMM dd, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {selectedProject.recent_comments.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No recent updates
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Project Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProject.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-foreground">{task.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                  {task.priority}
                                </Badge>
                                {task.due_date && (
                                  <span>Due {format(new Date(task.due_date), 'MMM dd')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(task.status)} variant="secondary">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {selectedProject.tasks.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">
                          No tasks available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Project Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProject.milestones.map((milestone) => (
                        <div key={milestone.id} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-foreground">{milestone.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Due {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {milestone.is_critical && (
                                <Badge variant="destructive">Critical</Badge>
                              )}
                              <Badge className={getStatusColor(milestone.status)} variant="secondary">
                                {milestone.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={milestone.completion_percentage} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {milestone.completion_percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {selectedProject.milestones.length === 0 && (
                        <p className="text-muted-foreground text-center py-8">
                          No milestones defined
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Project Communication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Communication Hub</h3>
                      <p className="text-muted-foreground">Advanced communication features coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Project Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">File Management</h3>
                      <p className="text-muted-foreground">Enhanced file management coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCustomerProjects;
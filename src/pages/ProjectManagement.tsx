import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
import { 
  Calendar, 
  KanbanSquare, 
  List, 
  BarChart3, 
  Users, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Seo from '@/components/Seo';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import CreateProjectForm from '@/components/project/forms/CreateProjectForm';
import CreateTaskForm from '@/components/project/forms/CreateTaskForm';
import InteractiveGanttChart from '@/components/project/InteractiveGanttChart';
import AnalyticsDashboard from '@/components/project/AnalyticsDashboard';
import NotificationCenter from '@/components/project/NotificationCenter';
import TeamManagement from '@/components/project/TeamManagement';
import KanbanBoard from '@/components/project/KanbanBoard';
import RealtimeCollaboration from '@/components/project/RealtimeCollaboration';
import AdvancedProjectAnalytics from '@/components/project/AdvancedProjectAnalytics';
import ResourceManagement from '@/components/project/ResourceManagement';
import ProjectCalendar from '@/components/project/ProjectCalendar';
import { useProjects } from '@/hooks/useProjects';
import { useProjectAnalytics } from '@/hooks/useProjectAnalytics';
import { useProjectManagementAnalytics } from '@/hooks/useProjectManagementAnalytics';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';

// Mock data for demonstration
const mockProjects = [
  {
    id: '1',
    title: 'E-commerce Website Redesign',
    description: 'Complete overhaul of the client website with modern design and improved UX',
    status: 'active',
    priority: 'high',
    progress: 75,
    team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    dueDate: '2024-12-15',
    tasksTotal: 24,
    tasksCompleted: 18,
    estimatedHours: 120,
    actualHours: 90,
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'React Native app for iOS and Android platforms',
    status: 'planning',
    priority: 'medium',
    progress: 25,
    team: ['Sarah Wilson', 'Tom Brown'],
    dueDate: '2025-02-28',
    tasksTotal: 45,
    tasksCompleted: 11,
    estimatedHours: 200,
    actualHours: 45,
    color: '#10b981'
  },
  {
    id: '3',
    title: 'API Integration Project',
    description: 'Integrate third-party payment and shipping APIs',
    status: 'on_hold',
    priority: 'low',
    progress: 50,
    team: ['Alex Chen'],
    dueDate: '2024-11-30',
    tasksTotal: 15,
    tasksCompleted: 7,
    estimatedHours: 80,
    actualHours: 35,
    color: '#f59e0b'
  }
];

const mockTasks = [
  {
    id: '1',
    title: 'Design homepage mockup',
    status: 'completed',
    priority: 'high',
    assignee: 'Jane Smith',
    dueDate: '2024-11-20',
    projectId: '1'
  },
  {
    id: '2',
    title: 'Implement user authentication',
    status: 'in_progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2024-11-25',
    projectId: '1'
  },
  {
    id: '3',
    title: 'Setup payment gateway',
    status: 'todo',
    priority: 'medium',
    assignee: 'Mike Johnson',
    dueDate: '2024-11-30',
    projectId: '1'
  },
  {
    id: '4',
    title: 'Create wireframes',
    status: 'review',
    priority: 'medium',
    assignee: 'Sarah Wilson',
    dueDate: '2024-11-22',
    projectId: '2'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'planning': return 'bg-blue-500';
    case 'on_hold': return 'bg-yellow-500';
    case 'completed': return 'bg-gray-500';
    default: return 'bg-gray-400';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'highest': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    case 'lowest': return 'outline';
    default: return 'default';
  }
};

const getTaskStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'review': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const ProjectManagement = () => {
  const { projects, tasks, loading } = useProjects();
  const { analytics } = useProjectAnalytics();
  const { analytics: realAnalytics, loading: analyticsLoading } = useProjectManagementAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const upcomingDeadlines = tasks
    .filter(task => task.due_date && new Date(task.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const unreadNotifications = 7; // Mock notification count

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title="Project Management - 404 Code Lab"
        description="Professional project management system with Kanban boards, Gantt charts, team collaboration, and comprehensive reporting for 404 Code Lab."
      />
      
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 pt-20 md:pt-24">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Project Overview</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Monitor and manage all your active projects
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <CreateProjectForm 
                  onSuccess={() => setShowCreateProject(false)}
                  onCancel={() => setShowCreateProject(false)}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <CreateTaskForm 
                  availableProjects={projects.map(p => ({ id: p.id, title: p.title }))}
                  onSuccess={() => setShowCreateTask(false)}
                  onCancel={() => setShowCreateTask(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <KanbanSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <List className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due This Week</p>
                  <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">
                    {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.completion_percentage || 0), 0) / projects.length) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Main Content Tabs */}
        <MobileTabs defaultValue="overview" className="w-full">
          <MobileTabsList className="w-full">
            <MobileTabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="kanban" className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Kanban</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="gantt" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Gantt</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Calendar</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Analytics</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Team</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="notifications" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Alerts</span>
            </MobileTabsTrigger>
          </MobileTabsList>

          <MobileTabsContent value="overview" className="space-y-6">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)} ml-2 mt-1`} />
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

                     {/* Stats */}
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <p className="text-muted-foreground">Tasks</p>
                         <p className="font-medium">{tasks.filter(t => t.project_id === project.id && t.status === 'completed').length}/{tasks.filter(t => t.project_id === project.id).length}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Hours</p>
                         <p className="font-medium">
                           {project.total_hours_logged || 0}/
                           {tasks.filter(t => t.project_id === project.id).reduce((sum, task) => sum + (task.estimated_hours || 0), 0) || 0}
                         </p>
                       </div>
                     </div>

                     {/* Team and Due Date */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Users className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm">Project Team</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm">
                           {project.estimated_completion_date ? new Date(project.estimated_completion_date).toLocaleDateString() : 'No deadline'}
                         </span>
                       </div>
                     </div>

                    {/* Priority Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Tasks and Upcoming Deadlines */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                           <p className="text-xs text-muted-foreground">
                            Assigned to {task.assignee_id || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className={getTaskStatusColor(task.status || 'todo')}>
                            {(task.status || 'todo').replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityColor(task.priority || 'medium')}>
                            {task.priority || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                           <p className="text-xs text-muted-foreground">
                            Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority || 'medium')}>
                            {task.priority || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </MobileTabsContent>

          <MobileTabsContent value="kanban" className="space-y-6">
            <div className="h-[800px]">
              <KanbanBoard />
            </div>
          </MobileTabsContent>

          <MobileTabsContent value="gantt" className="space-y-6">
            <div className="h-[800px]">
              <InteractiveGanttChart 
                projects={projects.map(p => ({
                  id: p.id,
                  title: p.title,
                  startDate: new Date(p.created_at),
                  endDate: p.estimated_completion_date ? new Date(p.estimated_completion_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  tasks: tasks
                    .filter(t => t.project_id === p.id)
                    .map(t => ({
                      id: t.id,
                      title: t.title,
                      startDate: t.start_date ? new Date(t.start_date) : new Date(t.created_at),
                      endDate: t.due_date ? new Date(t.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      status: t.status || 'todo',
                      priority: t.priority || 'medium',
                      assignee: t.assignee_id || 'Unassigned',
                      progress: t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 0,
                      dependencies: [],
                      project_id: t.project_id,
                      estimated_hours: t.estimated_hours,
                      actual_hours: t.actual_hours
                    }))
                }))}
              />
            </div>
          </MobileTabsContent>

          <MobileTabsContent value="calendar">
            {showCalendar ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Project Calendar</h3>
                  <Button variant="outline" onClick={() => setShowCalendar(false)}>
                    Back to Summary
                  </Button>
                </div>
                <ProjectCalendar />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                    <p className="text-muted-foreground mb-4">
                      View deadlines, meetings, and milestones in calendar format
                    </p>
                    <Button onClick={() => setShowCalendar(true)}>Open Calendar</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </MobileTabsContent>

          <MobileTabsContent value="analytics">
            {analyticsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">Loading analytics...</p>
                  </div>
                </CardContent>
              </Card>
            ) : realAnalytics ? (
              <AnalyticsDashboard data={realAnalytics} />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      No analytics data available. Create some projects and tasks to see analytics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </MobileTabsContent>

          <MobileTabsContent value="team">
            <TeamManagement />
          </MobileTabsContent>

          <MobileTabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NotificationCenter />
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Project Updates</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Task Assignments</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deadline Reminders</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Team Activity</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MobileTabsContent>
        </MobileTabs>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectManagement;
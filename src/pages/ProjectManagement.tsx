import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import Seo from '@/components/Seo';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingDeadlines = mockTasks
    .filter(task => new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <>
      <Seo 
        title="Project Management - 404 Code Lab"
        description="Professional project management system with Kanban boards, Gantt charts, team collaboration, and comprehensive reporting for 404 Code Lab."
      />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="text-muted-foreground">
              Manage projects, tasks, and team collaboration efficiently
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
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
                    {mockProjects.filter(p => p.status === 'active').length}
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
                  <p className="text-2xl font-bold">{mockTasks.length}</p>
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
                    {Math.round(mockProjects.reduce((acc, p) => acc + p.progress, 0) / mockProjects.length)}%
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-medium">{project.tasksCompleted}/{project.tasksTotal}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hours</p>
                        <p className="font-medium">{project.actualHours}/{project.estimatedHours}</p>
                      </div>
                    </div>

                    {/* Team and Due Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{project.team.length} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(project.dueDate).toLocaleDateString()}
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                    {mockTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Assigned to {task.assignee}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
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
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <KanbanSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Kanban Board</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop tasks between columns to update their status
                  </p>
                  <Button>Open Kanban Board</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gantt">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gantt Chart</h3>
                  <p className="text-muted-foreground mb-4">
                    Visualize project timelines, dependencies, and critical paths
                  </p>
                  <Button>Open Gantt Chart</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                  <p className="text-muted-foreground mb-4">
                    View deadlines, meetings, and milestones in calendar format
                  </p>
                  <Button>Open Calendar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics & Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate insights on project progress, team productivity, and timelines
                  </p>
                  <Button>View Reports</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProjectManagement;
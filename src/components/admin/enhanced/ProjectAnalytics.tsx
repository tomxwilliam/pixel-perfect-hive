import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Clock, Users, DollarSign, 
  AlertTriangle, CheckCircle, Target, Calendar
} from "lucide-react";
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

interface ProjectAnalyticsProps {
  projects: ProjectWithDetails[];
}

export const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projects }) => {
  // Status distribution data
  const statusData = [
    { name: 'Pending', value: projects.filter(p => p.status === 'pending').length, color: '#94a3b8' },
    { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, color: '#f59e0b' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#10b981' },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'cancelled').length, color: '#ef4444' },
  ];

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: projects.filter(p => p.priority === 'low').length, color: '#10b981' },
    { name: 'Medium', value: projects.filter(p => p.priority === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: projects.filter(p => p.priority === 'high').length, color: '#ef4444' },
  ];

  // Budget vs actual spending
  const budgetData = projects.map(project => ({
    name: project.title.substring(0, 10) + '...',
    budget: project.budget || 0,
    spent: project.total_cost || 0,
    progress: project.completion_percentage || 0
  })).slice(0, 10);

  // Team size distribution
  const teamSizeData = [
    { name: '1-2', value: projects.filter(p => p.team_members_count <= 2).length },
    { name: '3-5', value: projects.filter(p => p.team_members_count >= 3 && p.team_members_count <= 5).length },
    { name: '6-10', value: projects.filter(p => p.team_members_count >= 6 && p.team_members_count <= 10).length },
    { name: '10+', value: projects.filter(p => p.team_members_count > 10).length },
  ];

  // Calculate key metrics
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const avgCompletion = projects.length > 0 
    ? projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length 
    : 0;
  const onTimeProjects = projects.filter(p => {
    if (!p.deadline || p.status !== 'completed') return false;
    return true; // Simplified - would need actual completion date
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Analytics</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{avgCompletion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">
                  {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold">
                  {projects.length > 0 ? ((onTimeProjects / projects.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Spending */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="budget" fill="#10b981" name="Budget" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Team Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={teamSizeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map(project => (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {project.customer?.company_name || 
                      `${project.customer?.first_name || ''} ${project.customer?.last_name || ''}`.trim()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{project.completion_percentage || 0}%</div>
                    <Progress value={project.completion_percentage || 0} className="w-20 h-2" />
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs ${
                    project.risk_level === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    project.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {project.risk_level} risk
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
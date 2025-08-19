import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
  Download
} from 'lucide-react';
import { useProjectAnalytics } from '@/hooks/useProjectAnalytics';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface AdvancedProjectAnalyticsProps {
  projectId?: string;
}

const AdvancedProjectAnalytics: React.FC<AdvancedProjectAnalyticsProps> = ({ projectId }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('overview');
  const { analytics, loading } = useProjectAnalytics();

  // Mock enhanced analytics data
  const enhancedAnalytics = useMemo(() => ({
    overview: {
      totalProjects: 24,
      activeProjects: 8,
      completedProjects: 16,
      totalTasks: 342,
      completedTasks: 278,
      totalHours: 1840,
      billableHours: 1520,
      totalRevenue: 75000,
      teamUtilization: 85,
      avgProjectDuration: 45,
      onTimeDelivery: 92
    },
    productivity: [
      { day: 'Mon', completed: 12, started: 8, blocked: 2 },
      { day: 'Tue', completed: 15, started: 10, blocked: 1 },
      { day: 'Wed', completed: 18, started: 12, blocked: 3 },
      { day: 'Thu', completed: 14, started: 9, blocked: 2 },
      { day: 'Fri', completed: 20, started: 15, blocked: 1 },
      { day: 'Sat', completed: 8, started: 5, blocked: 0 },
      { day: 'Sun', completed: 6, started: 3, blocked: 1 }
    ],
    burndown: [
      { sprint: 'Week 1', planned: 100, actual: 98, ideal: 100 },
      { sprint: 'Week 2', planned: 80, actual: 75, ideal: 80 },
      { sprint: 'Week 3', planned: 60, actual: 58, ideal: 60 },
      { sprint: 'Week 4', planned: 40, actual: 35, ideal: 40 },
      { sprint: 'Week 5', planned: 20, actual: 18, ideal: 20 },
      { sprint: 'Week 6', planned: 0, actual: 0, ideal: 0 }
    ],
    teamPerformance: [
      { name: 'John Doe', tasks: 45, hours: 320, efficiency: 95 },
      { name: 'Jane Smith', tasks: 38, hours: 285, efficiency: 88 },
      { name: 'Mike Johnson', tasks: 42, hours: 310, efficiency: 92 },
      { name: 'Sarah Wilson', tasks: 36, hours: 270, efficiency: 85 },
      { name: 'Tom Brown', tasks: 33, hours: 245, efficiency: 82 }
    ],
    projectHealth: [
      { name: 'On Track', value: 65, color: '#10b981' },
      { name: 'At Risk', value: 25, color: '#f59e0b' },
      { name: 'Critical', value: 10, color: '#ef4444' }
    ],
    resourceUtilization: [
      { resource: 'Frontend Dev', allocated: 160, used: 145, capacity: 160 },
      { resource: 'Backend Dev', allocated: 120, used: 118, capacity: 120 },
      { resource: 'UI/UX Design', allocated: 80, used: 75, capacity: 80 },
      { resource: 'QA Testing', allocated: 60, used: 55, capacity: 60 },
      { resource: 'DevOps', allocated: 40, used: 38, capacity: 40 }
    ]
  }), []);

  const exportReport = () => {
    // Implementation for exporting analytics report
    console.log('Exporting analytics report...');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into project performance and team productivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{enhancedAnalytics.overview.activeProjects}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round((enhancedAnalytics.overview.completedTasks / enhancedAnalytics.overview.totalTasks) * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                <p className="text-2xl font-bold">{enhancedAnalytics.overview.teamUtilization}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Billable Hours</p>
                <p className="text-2xl font-bold">{enhancedAnalytics.overview.billableHours}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">£{(enhancedAnalytics.overview.totalRevenue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+22%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold">{enhancedAnalytics.overview.onTimeDelivery}%</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="productivity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="health">Project Health</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Productivity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enhancedAnalytics.productivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                  <Bar dataKey="started" fill="hsl(var(--secondary))" name="Started" />
                  <Bar dataKey="blocked" fill="hsl(var(--destructive))" name="Blocked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burndown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Burndown Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enhancedAnalytics.burndown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancedAnalytics.teamPerformance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.tasks} tasks • {member.hours} hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.efficiency}% Efficiency</p>
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${member.efficiency}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant={member.efficiency >= 90 ? "default" : "secondary"}>
                        {member.efficiency >= 90 ? "Excellent" : "Good"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Health Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={enhancedAnalytics.projectHealth}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {enhancedAnalytics.projectHealth.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {enhancedAnalytics.projectHealth.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name} ({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enhancedAnalytics.resourceUtilization.map((resource, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{resource.resource}</span>
                        <span>{Math.round((resource.used / resource.capacity) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(resource.used / resource.capacity) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{resource.used}h used</span>
                        <span>{resource.capacity}h capacity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedProjectAnalytics;
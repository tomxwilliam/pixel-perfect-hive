import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Clock, Users, CheckCircle, AlertTriangle,
  MessageSquare, Star, Target, Calendar
} from 'lucide-react';

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number;
  firstResponseTime: number;
  satisfactionRating: number;
  escalatedCount: number;
}

interface CategoryStats {
  name: string;
  count: number;
  color: string;
}

interface DailyStats {
  date: string;
  created: number;
  resolved: number;
}

export const SupportReporting = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResolutionTime: 0,
    firstResponseTime: 0,
    satisfactionRating: 0,
    escalatedCount: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  useEffect(() => {
    fetchReportingData();
  }, [timeRange]);

  const fetchReportingData = async () => {
    try {
      setLoading(true);
      
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch basic ticket stats
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*, category:ticket_categories(name, color), surveys:ticket_surveys(*)')
        .gte('created_at', startDate.toISOString());

      if (ticketsError) throw ticketsError;

      // Calculate statistics
      const totalTickets = tickets?.length || 0;
      const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
      const inProgressTickets = tickets?.filter(t => t.status === 'in_progress').length || 0;
      const resolvedTickets = tickets?.filter(t => t.status === 'resolved').length || 0;
      const closedTickets = tickets?.filter(t => t.status === 'closed').length || 0;
      const escalatedTickets = tickets?.filter(t => t.is_escalated).length || 0;

      // Calculate average resolution time
      const resolvedTicketsWithTime = tickets?.filter(t => 
        t.status === 'resolved' && t.resolved_at && t.created_at
      ) || [];
      
      const avgResolutionTime = resolvedTicketsWithTime.length > 0
        ? resolvedTicketsWithTime.reduce((acc, ticket) => {
            const created = new Date(ticket.created_at);
            const resolved = new Date(ticket.resolved_at!);
            return acc + (resolved.getTime() - created.getTime());
          }, 0) / (resolvedTicketsWithTime.length * 1000 * 60 * 60) // Convert to hours
        : 0;

      // Calculate first response time
      const ticketsWithResponse = tickets?.filter(t => t.first_response_at) || [];
      const avgFirstResponseTime = ticketsWithResponse.length > 0
        ? ticketsWithResponse.reduce((acc, ticket) => {
            const created = new Date(ticket.created_at);
            const firstResponse = new Date(ticket.first_response_at!);
            return acc + (firstResponse.getTime() - created.getTime());
          }, 0) / (ticketsWithResponse.length * 1000 * 60 * 60)
        : 0;

      // Calculate satisfaction rating
      const allSurveys = tickets?.flatMap(t => t.surveys || []) || [];
      const avgSatisfaction = allSurveys.length > 0
        ? allSurveys.reduce((acc, survey) => acc + (survey.rating || 0), 0) / allSurveys.length
        : 0;

      setStats({
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        avgResolutionTime,
        firstResponseTime: avgFirstResponseTime,
        satisfactionRating: avgSatisfaction,
        escalatedCount: escalatedTickets
      });

      // Category statistics
      const categoryMap = new Map<string, { count: number; color: string }>();
      tickets?.forEach(ticket => {
        if (ticket.category) {
          const existing = categoryMap.get(ticket.category.name) || { count: 0, color: ticket.category.color };
          categoryMap.set(ticket.category.name, {
            count: existing.count + 1,
            color: ticket.category.color
          });
        }
      });

      const categoryStatsArray = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        color: data.color || '#6B7280'
      }));

      setCategoryStats(categoryStatsArray);

      // Daily statistics for the chart
      const dailyMap = new Map<string, { created: number; resolved: number }>();
      
      // Initialize all days
      for (let i = 0; i < daysAgo; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { created: 0, resolved: 0 });
      }

      // Count created tickets
      tickets?.forEach(ticket => {
        const dateStr = ticket.created_at.split('T')[0];
        if (dailyMap.has(dateStr)) {
          const existing = dailyMap.get(dateStr)!;
          dailyMap.set(dateStr, { ...existing, created: existing.created + 1 });
        }
      });

      // Count resolved tickets
      tickets?.filter(t => t.resolved_at).forEach(ticket => {
        const dateStr = ticket.resolved_at!.split('T')[0];
        if (dailyMap.has(dateStr)) {
          const existing = dailyMap.get(dateStr)!;
          dailyMap.set(dateStr, { ...existing, resolved: existing.resolved + 1 });
        }
      });

      const dailyStatsArray = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          created: data.created,
          resolved: data.resolved
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setDailyStats(dailyStatsArray);

    } catch (error) {
      console.error('Error fetching reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.round(hours * 10) / 10}h`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-40 bg-muted"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Analytics</h2>
          <p className="text-muted-foreground">Comprehensive overview of support performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="destructive">{stats.open} Open</Badge>
              <Badge variant="secondary">{stats.resolved} Resolved</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(stats.avgResolutionTime)}</div>
            <p className="text-xs text-muted-foreground">
              First response: {formatHours(stats.firstResponseTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.satisfactionRating.toFixed(1)}/5
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-4 w-4 ${
                    star <= stats.satisfactionRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalatedCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.escalatedCount / stats.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Ticket Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Ticket Trends</CardTitle>
            <CardDescription>Created vs resolved tickets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#8884d8" 
                  name="Created"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#82ca9d" 
                  name="Resolved"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Category</CardTitle>
            <CardDescription>Distribution of tickets across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Breakdown</CardTitle>
          <CardDescription>Current distribution of ticket statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { status: 'Open', count: stats.open, color: '#EF4444' },
                { status: 'In Progress', count: stats.inProgress, color: '#F59E0B' },
                { status: 'Resolved', count: stats.resolved, color: '#10B981' },
                { status: 'Closed', count: stats.closed, color: '#6B7280' }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key performance indicators for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.total > 0 ? ((stats.resolved + stats.closed) / stats.total * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatHours(stats.firstResponseTime)}
              </div>
              <p className="text-sm text-muted-foreground">Avg First Response</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.escalatedCount}
              </div>
              <p className="text-sm text-muted-foreground">Escalations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
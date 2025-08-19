
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FolderOpen, Ticket, DollarSign, TrendingUp, AlertCircle, Calendar, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardStats {
  totalCustomers: number;
  totalProjects: number;
  openTickets: number;
  totalRevenue: number;
  pendingInvoices: number;
  activeProjects: number;
  todayBookings: number;
  urgentTickets: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'ticket' | 'booking' | 'invoice';
  title: string;
  timestamp: string;
  status?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  projects: {
    label: "Projects",
    color: "hsl(var(--chart-2))",
  },
};

export const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProjects: 0,
    openTickets: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    activeProjects: 0,
    todayBookings: 0,
    urgentTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic counts first for instant display
        const basicCounts = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress'])
        ]);

        // Set basic stats immediately
        setStats(prev => ({
          ...prev,
          totalCustomers: basicCounts[0].count || 0,
          totalProjects: basicCounts[1].count || 0,
          openTickets: basicCounts[2].count || 0
        }));
        setLoading(false); // Show basic stats immediately

        // Fetch detailed data in background
        try {
          let todayBookingCount = 0;
          try {
            const bookingsResult = await supabase.from('call_bookings').select('*', { count: 'exact', head: true })
              .gte('scheduled_at', `${new Date().toISOString().split('T')[0]}T00:00:00`)
              .lt('scheduled_at', `${new Date().toISOString().split('T')[0]}T23:59:59`);
            todayBookingCount = bookingsResult.count || 0;
          } catch (bookingError) {
            console.warn('Call bookings table not available:', bookingError);
          }

          const [
            { count: activeProjectCount },
            { count: urgentTicketCount },
            { data: invoices }
          ] = await Promise.all([
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
            supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('priority', 'high').in('status', ['open', 'in_progress']),
            supabase.from('invoices').select('amount, status, created_at').limit(100)
          ]);

        const totalRevenue = invoices
          ?.filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

        const pendingInvoices = invoices
          ?.filter(inv => inv.status === 'pending').length || 0;

        setStats(prev => ({
          ...prev,
          activeProjects: activeProjectCount || 0,
          urgentTickets: urgentTicketCount || 0,
          totalRevenue,
          pendingInvoices,
          todayBookings: todayBookingCount
        }));

        // Fetch recent activity and generate chart data
        await fetchRecentActivity();
        generateChartData(invoices || []);

        } catch (detailedError) {
          console.warn('Error fetching detailed stats:', detailedError);
        }

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const activities: RecentActivity[] = [];

        // Recent projects
        const { data: projects } = await supabase
          .from('projects')
          .select('id, title, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3);

        projects?.forEach(project => {
          activities.push({
            id: project.id,
            type: 'project',
            title: `New project: ${project.title}`,
            timestamp: project.created_at,
            status: project.status
          });
        });

        // Recent tickets
        const { data: tickets } = await supabase
          .from('tickets')
          .select('id, title, created_at, priority')
          .order('created_at', { ascending: false })
          .limit(3);

        tickets?.forEach(ticket => {
          activities.push({
            id: ticket.id,
            type: 'ticket',
            title: `${ticket.priority === 'high' ? '🔥 ' : ''}${ticket.title}`,
            timestamp: ticket.created_at,
            status: ticket.priority
          });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 5));

      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    const generateChartData = (invoices: any[]) => {
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = last30Days.map(date => {
        const dayInvoices = invoices.filter(inv => 
          inv.created_at.startsWith(date) && inv.status === 'paid'
        );
        
        return {
          date: date.slice(-5), // MM-DD format
          revenue: dayInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
          projects: dayInvoices.length
        };
      });

      setChartData(chartData);
    };

    fetchStats();

    // Set up real-time subscriptions
    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchStats();
        toast({
          title: "New Project Activity",
          description: "Projects data has been updated",
        });
      })
      .subscribe();

    const ticketsChannel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchStats();
        toast({
          title: "New Support Activity",
          description: "Tickets data has been updated",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(ticketsChannel);
    };
  }, [toast]);

  if (loading) {
    return (
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert for urgent items */}
      {(stats.urgentTickets > 0 || stats.todayBookings > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="text-sm">
                {stats.urgentTickets > 0 && (
                  <span className="text-orange-800">
                    {stats.urgentTickets} urgent ticket{stats.urgentTickets > 1 ? 's' : ''} require attention
                  </span>
                )}
                {stats.urgentTickets > 0 && stats.todayBookings > 0 && ' • '}
                {stats.todayBookings > 0 && (
                  <span className="text-orange-800">
                    {stats.todayBookings} call{stats.todayBookings > 1 ? 's' : ''} scheduled today
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Of {stats.totalProjects} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.openTickets}
              {stats.urgentTickets > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.urgentTickets} urgent
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card className={isMobile ? 'col-span-1' : 'md:col-span-3'}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className={isMobile ? "h-[150px]" : "h-[200px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" fontSize={isMobile ? 10 : 12} />
                  <YAxis fontSize={isMobile ? 10 : 12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Status */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </div>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2">
                    <Badge variant={activity.type === 'ticket' && activity.status === 'high' ? 'destructive' : 'outline'}>
                      {activity.type}
                    </Badge>
                    <span className="text-sm flex-1">{activity.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Updates</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">File Storage</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

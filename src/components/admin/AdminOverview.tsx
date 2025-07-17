
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FolderOpen, Ticket, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalCustomers: number;
  totalProjects: number;
  openTickets: number;
  totalRevenue: number;
  pendingInvoices: number;
  activeProjects: number;
}

export const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalProjects: 0,
    openTickets: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch customer count
        const { count: customerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');

        // Fetch project count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        // Fetch active projects
        const { count: activeProjectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');

        // Fetch open tickets
        const { count: openTicketCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .in('status', ['open', 'in_progress']);

        // Fetch invoice data
        const { data: invoices } = await supabase
          .from('invoices')
          .select('amount, status');

        const totalRevenue = invoices
          ?.filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

        const pendingInvoices = invoices
          ?.filter(inv => inv.status === 'pending').length || 0;

        setStats({
          totalCustomers: customerCount || 0,
          totalProjects: projectCount || 0,
          openTickets: openTicketCount || 0,
          totalRevenue,
          pendingInvoices,
          activeProjects: activeProjectCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">{stats.openTickets}</div>
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
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} pending invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">New Project</Badge>
                <span className="text-sm">Customer submitted new web app project</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Support</Badge>
                <span className="text-sm">High priority ticket created</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Payment</Badge>
                <span className="text-sm">Invoice #1001 paid</span>
              </div>
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Calendar, Activity, DollarSign, Target, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CRMPipeline } from './CRMPipeline';
import { AdminCustomers } from './AdminCustomers';
import { CRMAnalytics } from './analytics/CRMAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRMStats {
  totalLeads: number;
  totalCustomers: number;
  totalPipelineValue: number;
  thisMonthLeads: number;
  conversionRate: number;
  avgDealSize: number;
  topSources: Array<{ source: string; count: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    created_at: string;
  }>;
}

export const CRMDashboard = () => {
  const [stats, setStats] = useState<CRMStats>({
    totalLeads: 0,
    totalCustomers: 0,
    totalPipelineValue: 0,
    thisMonthLeads: 0,
    conversionRate: 0,
    avgDealSize: 0,
    topSources: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchCRMStats = async () => {
    try {
      setLoading(true);

      // Fetch basic data first for faster initial load
      const basicStatsPromise = Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer')
      ]);

      const [leadsCount, customersCount] = await basicStatsPromise;

      // Set basic stats immediately
      setStats(prev => ({
        ...prev,
        totalLeads: leadsCount.count || 0,
        totalCustomers: customersCount.count || 0
      }));
      setLoading(false); // Show basic stats immediately

      // Fetch detailed data in background
      try {
        let activitiesData = [];
        try {
          const activitiesResult = await supabase
            .from('lead_activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          activitiesData = activitiesResult.data || [];
        } catch (activitiesError) {
          console.warn('Lead activities table not available:', activitiesError);
        }

        const [leadsData, customersData] = await Promise.all([
          supabase.from('leads').select('*').limit(100),
          supabase.from('profiles').select('*').eq('role', 'customer').limit(50)
        ]);

        const leads = leadsData.data || [];
        const customers = customersData.data || [];

        if (leads.length > 0) {
          const currentMonth = new Date().getMonth();
          const thisMonthLeads = leads.filter(lead => 
            new Date(lead.created_at).getMonth() === currentMonth
          ).length;

          const totalPipelineValue = leads.reduce((sum, lead) => 
            sum + (lead.deal_value || 0), 0
          );

          const convertedLeads = leads.filter(lead => lead.converted_to_customer).length;
          const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
          const avgDealSize = leads.length > 0 ? totalPipelineValue / leads.length : 0;

          // Calculate top sources
          const sourceCount: { [key: string]: number } = {};
          leads.forEach(lead => {
            if (lead.source) {
              sourceCount[lead.source] = (sourceCount[lead.source] || 0) + 1;
            }
          });

          const topSources = Object.entries(sourceCount)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setStats({
            totalLeads: leads.length,
            totalCustomers: customers.length,
            totalPipelineValue,
            thisMonthLeads,
            conversionRate,
            avgDealSize,
            topSources,
            recentActivities: activitiesData.map(activity => ({
              id: activity.id,
              type: activity.activity_type,
              description: activity.description || activity.title,
              created_at: activity.created_at
            }))
          });
        }
      } catch (error) {
        console.warn('Error fetching detailed CRM stats:', error);
      }
    } catch (error) {
      console.error('Error fetching basic CRM stats:', error);
      toast({
        title: "Error",
        description: "Failed to load CRM statistics",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and sales pipeline
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.thisMonthLeads} this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="text-xs text-green-600">
                  {stats.conversionRate.toFixed(1)}% conversion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">£{stats.totalPipelineValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  £{stats.avgDealSize.toLocaleString()} avg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLeads - stats.totalCustomers} in pipeline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional insights */}
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
        {/* Top Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Top Lead Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">
                      {source.source || 'Unknown'}
                    </span>
                  </div>
                  <Badge variant="outline">{source.count}</Badge>
                </div>
              ))}
              {stats.topSources.length === 0 && (
                <p className="text-sm text-muted-foreground">No lead sources data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
              {stats.recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRM Sections */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          <TabsTrigger value="customers">Customer Management</TabsTrigger>
          {!isMobile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <CRMPipeline />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <AdminCustomers />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <CRMAnalytics />
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
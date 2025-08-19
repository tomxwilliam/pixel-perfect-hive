import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  LineChart,
  Download,
  Filter
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  conversionTrend: Array<{ month: string; conversions: number; leads: number; rate: number }>;
  leadSources: Array<{ source: string; count: number; value: number; color: string }>;
  pipelinePerformance: Array<{ stage: string; count: number; value: number }>;
  revenueForecasting: Array<{ month: string; actual: number; forecast: number; target: number }>;
  dealVelocity: Array<{ period: string; avgDays: number; avgValue: number }>;
  activityMetrics: Array<{ activity: string; count: number; effectiveness: number }>;
  salesRepPerformance: Array<{ rep: string; deals: number; revenue: number; conversionRate: number }>;
}

const chartConfig = {
  conversions: { label: "Conversions", color: "hsl(var(--chart-1))" },
  leads: { label: "Leads", color: "hsl(var(--chart-2))" },
  rate: { label: "Rate", color: "hsl(var(--chart-3))" },
  actual: { label: "Actual", color: "hsl(var(--chart-1))" },
  forecast: { label: "Forecast", color: "hsl(var(--chart-2))" },
  target: { label: "Target", color: "hsl(var(--chart-3))" },
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const CRMAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    conversionTrend: [],
    leadSources: [],
    pipelinePerformance: [],
    revenueForecasting: [],
    dealVelocity: [],
    activityMetrics: [],
    salesRepPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('conversions');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '1m':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      // Fetch data
      let activitiesData = [];
      try {
        const activitiesResult = await supabase.from('lead_activities').select('*').gte('created_at', startDate.toISOString());
        activitiesData = activitiesResult.data || [];
      } catch (error) {
        console.warn('Lead activities table not available:', error);
      }

      const [leadsData, customersData, invoicesData] = await Promise.all([
        supabase.from('leads').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('profiles').select('*').eq('role', 'customer').gte('created_at', startDate.toISOString()),
        supabase.from('invoices').select('*').gte('created_at', startDate.toISOString())
      ]);

      const leads = leadsData.data || [];
      const customers = customersData.data || [];
      const invoices = invoicesData.data || [];
      const activities = activitiesData;

      // Generate conversion trend data
      const conversionTrend = generateConversionTrend(leads, customers, startDate, endDate);
      
      // Generate lead sources analysis
      const leadSources = generateLeadSources(leads);
      
      // Generate pipeline performance
      const pipelinePerformance = generatePipelinePerformance(leads);
      
      // Generate revenue forecasting
      const revenueForecasting = generateRevenueForecasting(invoices, leads, startDate, endDate);
      
      // Generate deal velocity
      const dealVelocity = generateDealVelocity(leads, customers);
      
      // Generate activity metrics
      const activityMetrics = generateActivityMetrics(activities);
      
      // Generate sales rep performance (placeholder for now)
      const salesRepPerformance = generateSalesRepPerformance(leads, customers);

      setAnalyticsData({
        conversionTrend,
        leadSources,
        pipelinePerformance,
        revenueForecasting,
        dealVelocity,
        activityMetrics,
        salesRepPerformance
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateConversionTrend = (leads: any[], customers: any[], startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthKey = current.toISOString().slice(0, 7); // YYYY-MM
      const monthName = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthLeads = leads.filter(lead => lead.created_at.startsWith(monthKey));
      const monthConversions = customers.filter(customer => customer.created_at.startsWith(monthKey));
      
      months.push({
        month: monthName,
        leads: monthLeads.length,
        conversions: monthConversions.length,
        rate: monthLeads.length > 0 ? (monthConversions.length / monthLeads.length) * 100 : 0
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const generateLeadSources = (leads: any[]) => {
    const sourceCount: { [key: string]: { count: number; value: number } } = {};
    
    leads.forEach(lead => {
      const source = lead.source || 'Unknown';
      if (!sourceCount[source]) {
        sourceCount[source] = { count: 0, value: 0 };
      }
      sourceCount[source].count++;
      sourceCount[source].value += lead.deal_value || 0;
    });
    
    return Object.entries(sourceCount)
      .map(([source, data], index) => ({
        source,
        count: data.count,
        value: data.value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  };

  const generatePipelinePerformance = (leads: any[]) => {
    const stages = [
      { stage: 'New Leads', count: 0, value: 0 },
      { stage: 'Qualified', count: 0, value: 0 },
      { stage: 'Proposal', count: 0, value: 0 },
      { stage: 'Negotiation', count: 0, value: 0 },
      { stage: 'Converted', count: 0, value: 0 }
    ];

    leads.forEach(lead => {
      const stage = lead.converted_to_customer ? 4 : Math.floor(Math.random() * 4); // Placeholder logic
      stages[stage].count++;
      stages[stage].value += lead.deal_value || 0;
    });

    return stages;
  };

  const generateRevenueForecasting = (invoices: any[], leads: any[], startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthKey = current.toISOString().slice(0, 7);
      const monthName = current.toLocaleDateString('en-US', { month: 'short' });
      
      const monthInvoices = invoices.filter(inv => 
        inv.created_at.startsWith(monthKey) && inv.status === 'paid'
      );
      const actual = monthInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      
      // Simple forecasting based on pipeline
      const pipelineValue = leads
        .filter(lead => !lead.converted_to_customer)
        .reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
      const forecast = actual + (pipelineValue * 0.3); // 30% conversion estimate
      const target = actual * 1.2; // 20% growth target
      
      months.push({
        month: monthName,
        actual,
        forecast,
        target
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const generateDealVelocity = (leads: any[], customers: any[]) => {
    const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    return periods.map(period => ({
      period,
      avgDays: Math.floor(Math.random() * 30) + 14, // Placeholder: 14-44 days
      avgValue: Math.floor(Math.random() * 10000) + 5000 // Placeholder: £5k-15k
    }));
  };

  const generateActivityMetrics = (activities: any[]) => {
    const activityTypes: { [key: string]: { count: number; effectiveness: number } } = {};
    
    activities.forEach(activity => {
      const type = activity.activity_type || 'call';
      if (!activityTypes[type]) {
        activityTypes[type] = { count: 0, effectiveness: 0 };
      }
      activityTypes[type].count++;
    });
    
    return Object.entries(activityTypes).map(([activity, data]) => ({
      activity: activity.charAt(0).toUpperCase() + activity.slice(1),
      count: data.count,
      effectiveness: Math.floor(Math.random() * 100) // Placeholder effectiveness
    }));
  };

  const generateSalesRepPerformance = (leads: any[], customers: any[]) => {
    // Placeholder data - in real implementation, you'd have sales rep assignments
    return [
      { rep: 'Admin User', deals: customers.length, revenue: customers.length * 5000, conversionRate: 25 },
      { rep: 'Sales Rep 1', deals: 8, revenue: 45000, conversionRate: 32 },
      { rep: 'Sales Rep 2', deals: 12, revenue: 67000, conversionRate: 28 }
    ];
  };

  const exportData = () => {
    const csvData = analyticsData.conversionTrend.map(item => 
      `${item.month},${item.leads},${item.conversions},${item.rate.toFixed(2)}%`
    ).join('\n');
    
    const blob = new Blob([`Month,Leads,Conversions,Rate\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">CRM Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your sales performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {analyticsData.conversionTrend.length > 0 
                    ? (analyticsData.conversionTrend.reduce((sum, item) => sum + item.rate, 0) / analyticsData.conversionTrend.length).toFixed(1)
                    : 0}%
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.5% from last period
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">
                  £{analyticsData.pipelinePerformance.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last period
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Velocity</p>
                <p className="text-2xl font-bold">
                  {analyticsData.dealVelocity.length > 0 
                    ? Math.round(analyticsData.dealVelocity.reduce((sum, item) => sum + item.avgDays, 0) / analyticsData.dealVelocity.length)
                    : 0} days
                </p>
                <div className="flex items-center text-xs text-red-600 mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3 days faster
                </div>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-2xl font-bold">
                  {analyticsData.pipelinePerformance.slice(0, -1).reduce((sum, item) => sum + item.count, 0)}
                </p>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12 new this week
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Trend</CardTitle>
                <CardDescription>Lead to customer conversion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData.conversionTrend}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Velocity</CardTitle>
                <CardDescription>Average time to close deals</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analyticsData.dealVelocity}>
                      <XAxis dataKey="period" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgDays" fill="var(--color-conversions)" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Distribution</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.leadSources}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Lead sources by value and volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.leadSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-muted-foreground">{source.count} leads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">£{source.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">total value</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline Performance</CardTitle>
              <CardDescription>Leads and value at each stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={analyticsData.pipelinePerformance} layout="horizontal">
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-leads)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>Actual vs forecasted vs target revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.revenueForecasting}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="actual" stackId="1" stroke="var(--color-actual)" fill="var(--color-actual)" />
                    <Area type="monotone" dataKey="forecast" stackId="2" stroke="var(--color-forecast)" fill="var(--color-forecast)" />
                    <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
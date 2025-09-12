import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  type: 'project' | 'customer' | 'financial' | 'social' | 'overall';
  period?: string; // 'week' | 'month' | 'quarter' | 'year'
  project_id?: string;
  customer_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, period = 'month', project_id, customer_id }: AnalyticsRequest = await req.json();

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    let analytics: any = {};

    switch (type) {
      case 'project':
        analytics = await calculateProjectAnalytics(supabaseClient, startDate, now, project_id);
        break;
      case 'customer':
        analytics = await calculateCustomerAnalytics(supabaseClient, startDate, now, customer_id);
        break;
      case 'financial':
        analytics = await calculateFinancialAnalytics(supabaseClient, startDate, now);
        break;
      case 'social':
        analytics = await calculateSocialAnalytics(supabaseClient, startDate, now);
        break;
      case 'overall':
        analytics = await calculateOverallAnalytics(supabaseClient, startDate, now);
        break;
      default:
        throw new Error('Invalid analytics type');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: analytics,
      period: period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to calculate analytics', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateProjectAnalytics(supabase: any, startDate: Date, endDate: Date, projectId?: string) {
  const projectFilter = projectId ? { eq: { id: projectId } } : {};
  
  // Project metrics
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, status, completion_percentage, budget, created_at, updated_at,
      project_tasks(id, status, estimated_hours, actual_hours),
      project_time_logs(hours_logged, is_billable, hourly_rate, total_cost)
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .match(projectFilter.eq || {});

  // Task completion rates
  let totalTasks = 0;
  let completedTasks = 0;
  let totalHours = 0;
  let billableHours = 0;
  let totalRevenue = 0;

  projects?.forEach(project => {
    totalTasks += project.project_tasks?.length || 0;
    completedTasks += project.project_tasks?.filter(task => task.status === 'completed').length || 0;
    
    project.project_time_logs?.forEach(log => {
      totalHours += log.hours_logged || 0;
      if (log.is_billable) {
        billableHours += log.hours_logged || 0;
        totalRevenue += log.total_cost || 0;
      }
    });
  });

  // Project status distribution
  const statusCounts = projects?.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Average project completion
  const avgCompletion = projects?.length ? 
    projects.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / projects.length : 0;

  return {
    total_projects: projects?.length || 0,
    active_projects: statusCounts['active'] || 0,
    completed_projects: statusCounts['completed'] || 0,
    average_completion: Math.round(avgCompletion),
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    task_completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    total_hours_logged: totalHours,
    billable_hours: billableHours,
    billability_rate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
    total_revenue: totalRevenue,
    status_distribution: statusCounts
  };
}

async function calculateCustomerAnalytics(supabase: any, startDate: Date, endDate: Date, customerId?: string) {
  const customerFilter = customerId ? { eq: { customer_id: customerId } } : {};

  // Customer projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, customer_id, status, budget, completion_percentage')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .match(customerFilter.eq || {});

  // Customer tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, customer_id, status, priority, created_at, resolved_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .match(customerFilter.eq || {});

  // Customer invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, customer_id, amount, status, created_at, paid_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .match(customerFilter.eq || {});

  // Calculate metrics
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const paidRevenue = invoices?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  const resolvedTickets = tickets?.filter(ticket => ticket.status === 'resolved').length || 0;
  const avgResolutionTime = calculateAverageResolutionTime(tickets?.filter(t => t.resolved_at) || []);

  return {
    total_customers: customerId ? 1 : new Set(projects?.map(p => p.customer_id)).size,
    total_projects: projects?.length || 0,
    active_projects: projects?.filter(p => p.status === 'active').length || 0,
    total_tickets: tickets?.length || 0,
    resolved_tickets: resolvedTickets,
    ticket_resolution_rate: tickets?.length ? Math.round((resolvedTickets / tickets.length) * 100) : 0,
    average_resolution_time_hours: avgResolutionTime,
    total_invoiced: totalRevenue,
    total_paid: paidRevenue,
    payment_rate: totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0
  };
}

async function calculateFinancialAnalytics(supabase: any, startDate: Date, endDate: Date) {
  // Revenue analytics
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status, created_at, paid_at, due_date')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const { data: quotes } = await supabase
    .from('quotes')
    .select('amount, status, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const totalPaid = invoices?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
  const totalPending = invoices?.filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  const totalQuoted = quotes?.reduce((sum, quote) => sum + (quote.amount || 0), 0) || 0;
  const acceptedQuotes = quotes?.filter(q => q.status === 'accepted').length || 0;
  const quoteConversionRate = quotes?.length ? Math.round((acceptedQuotes / quotes.length) * 100) : 0;

  // Overdue invoices
  const now = new Date();
  const overdueInvoices = invoices?.filter(inv => 
    inv.status === 'pending' && inv.due_date && new Date(inv.due_date) < now
  ) || [];
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return {
    total_invoiced: totalInvoiced,
    total_paid: totalPaid,
    total_pending: totalPending,
    overdue_amount: overdueAmount,
    collection_rate: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0,
    total_quoted: totalQuoted,
    quote_conversion_rate: quoteConversionRate,
    invoice_count: invoices?.length || 0,
    quote_count: quotes?.length || 0,
    overdue_invoice_count: overdueInvoices.length
  };
}

async function calculateSocialAnalytics(supabase: any, startDate: Date, endDate: Date) {
  const { data: posts } = await supabase
    .from('social_posts')
    .select('platform, engagement_likes, engagement_comments, engagement_shares, engagement_views, posted_at')
    .gte('posted_at', startDate.toISOString())
    .lte('posted_at', endDate.toISOString());

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('platform, follower_count, following_count, is_active');

  const totalPosts = posts?.length || 0;
  const totalEngagement = posts?.reduce((sum, post) => 
    sum + (post.engagement_likes || 0) + (post.engagement_comments || 0) + (post.engagement_shares || 0), 0) || 0;
  const totalViews = posts?.reduce((sum, post) => sum + (post.engagement_views || 0), 0) || 0;

  const platformStats = posts?.reduce((acc, post) => {
    if (!acc[post.platform]) {
      acc[post.platform] = { posts: 0, engagement: 0, views: 0 };
    }
    acc[post.platform].posts++;
    acc[post.platform].engagement += (post.engagement_likes || 0) + (post.engagement_comments || 0) + (post.engagement_shares || 0);
    acc[post.platform].views += post.engagement_views || 0;
    return acc;
  }, {}) || {};

  return {
    total_posts: totalPosts,
    total_engagement: totalEngagement,
    total_views: totalViews,
    average_engagement_per_post: totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0,
    connected_accounts: accounts?.filter(acc => acc.is_active).length || 0,
    total_followers: accounts?.reduce((sum, acc) => sum + (acc.follower_count || 0), 0) || 0,
    platform_stats: platformStats
  };
}

async function calculateOverallAnalytics(supabase: any, startDate: Date, endDate: Date) {
  const [projectAnalytics, customerAnalytics, financialAnalytics, socialAnalytics] = await Promise.all([
    calculateProjectAnalytics(supabase, startDate, endDate),
    calculateCustomerAnalytics(supabase, startDate, endDate),
    calculateFinancialAnalytics(supabase, startDate, endDate),
    calculateSocialAnalytics(supabase, startDate, endDate)
  ]);

  return {
    projects: projectAnalytics,
    customers: customerAnalytics,
    financial: financialAnalytics,
    social: socialAnalytics,
    summary: {
      total_revenue: financialAnalytics.total_paid,
      active_projects: projectAnalytics.active_projects,
      customer_satisfaction: customerAnalytics.ticket_resolution_rate,
      social_reach: socialAnalytics.total_followers
    }
  };
}

function calculateAverageResolutionTime(resolvedTickets: any[]): number {
  if (resolvedTickets.length === 0) return 0;
  
  const totalTime = resolvedTickets.reduce((sum, ticket) => {
    const created = new Date(ticket.created_at).getTime();
    const resolved = new Date(ticket.resolved_at).getTime();
    return sum + (resolved - created);
  }, 0);

  return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // Convert to hours
}
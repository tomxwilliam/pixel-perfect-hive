import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    onTrack: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
  };
  time: {
    totalHours: number;
    billableHours: number;
    averageHoursPerProject: number;
    efficiency: number;
  };
  budget: {
    totalBudget: number;
    spent: number;
    remaining: number;
    roi: number;
  };
  trends: {
    projectsOverTime: Array<{ month: string; projects: number; tasks: number }>;
    timeUtilization: Array<{ week: string; hours: number; efficiency: number }>;
  };
  performance: {
    teamProductivity: Array<{ name: string; hours: number; tasks: number }>;
    projectStatus: Array<{ name: string; value: number; color: string }>;
  };
}

export const useProjectManagementAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch projects data
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, status, created_at, budget, completion_percentage, estimated_completion_date, total_hours_logged');

        if (projectsError) throw projectsError;

        // Fetch tickets/tasks data  
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select('id, status, priority, created_at, resolved_at');

        if (ticketsError) throw ticketsError;

        // Fetch time logs data
        const { data: timeLogs, error: timeLogsError } = await supabase
          .from('ticket_time_logs')
          .select('id, hours_logged, billable, created_at');

        if (timeLogsError) throw timeLogsError;

        // Fetch invoices for budget analysis
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('amount, status, created_at');

        if (invoicesError) throw invoicesError;

        // Calculate analytics
        const now = new Date();
        const activeProjects = projects?.filter(p => p.status === 'in_progress') || [];
        const completedProjects = projects?.filter(p => p.status === 'completed') || [];
        const overdueProjects = projects?.filter(p => {
          if (!p.estimated_completion_date) return false;
          return new Date(p.estimated_completion_date) < now && p.status !== 'completed';
        }) || [];

        const openTickets = tickets?.filter(t => t.status === 'open') || [];
        const inProgressTickets = tickets?.filter(t => t.status === 'in_progress') || [];
        const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || [];
        const overdueTickets = tickets?.filter(t => {
          // Simple overdue logic - tickets open for more than 7 days
          const created = new Date(t.created_at);
          const daysDiff = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
          return daysDiff > 7 && (t.status === 'open' || t.status === 'in_progress');
        }) || [];

        const totalHours = timeLogs?.reduce((sum, log) => sum + Number(log.hours_logged || 0), 0) || 0;
        const billableHours = timeLogs?.filter(log => log.billable).reduce((sum, log) => sum + Number(log.hours_logged || 0), 0) || 0;
        
        const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget || 0), 0) || 0;
        const totalSpent = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount || 0), 0) || 0;

        // Generate monthly trends (last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const projectsOverTime = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthProjects = projects?.filter(p => {
            const created = new Date(p.created_at);
            return created >= monthStart && created <= monthEnd;
          }).length || 0;
          
          const monthTickets = tickets?.filter(t => {
            const created = new Date(t.created_at);
            return created >= monthStart && created <= monthEnd;
          }).length || 0;
          
          projectsOverTime.push({
            month: monthNames[date.getMonth()],
            projects: monthProjects,
            tasks: monthTickets
          });
        }

        // Generate weekly time utilization (last 4 weeks)
        const timeUtilization = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - (i * 7));
          
          const weekHours = timeLogs?.filter(log => {
            const created = new Date(log.created_at);
            return created >= weekStart && created <= weekEnd;
          }).reduce((sum, log) => sum + Number(log.hours_logged || 0), 0) || 0;
          
          timeUtilization.push({
            week: `W${4-i}`,
            hours: weekHours,
            efficiency: Math.min(90, Math.max(70, weekHours * 2)) // Simple efficiency calculation
          });
        }

        const analyticsData: AnalyticsData = {
          projects: {
            total: projects?.length || 0,
            active: activeProjects.length,
            completed: completedProjects.length,
            overdue: overdueProjects.length,
            onTrack: activeProjects.length - overdueProjects.length
          },
          tasks: {
            total: tickets?.length || 0,
            completed: resolvedTickets.length,
            inProgress: inProgressTickets.length,
            todo: openTickets.length,
            overdue: overdueTickets.length
          },
          time: {
            totalHours: Math.round(totalHours),
            billableHours: Math.round(billableHours),
            averageHoursPerProject: projects?.length ? Math.round(totalHours / projects.length) : 0,
            efficiency: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0
          },
          budget: {
            totalBudget: Math.round(totalBudget),
            spent: Math.round(totalSpent),
            remaining: Math.round(totalBudget - totalSpent),
            roi: totalSpent > 0 ? Math.round(((totalBudget - totalSpent) / totalSpent) * 100 * 10) / 10 : 0
          },
          trends: {
            projectsOverTime,
            timeUtilization
          },
          performance: {
            teamProductivity: [
              // This would need team member data - using placeholder for now
              { name: 'Team Average', hours: Math.round(totalHours / 4), tasks: Math.round((tickets?.length || 0) / 4) }
            ],
            projectStatus: [
              { name: 'Active', value: activeProjects.length, color: '#3b82f6' },
              { name: 'Completed', value: completedProjects.length, color: '#10b981' },
              { name: 'Overdue', value: overdueProjects.length, color: '#ef4444' },
              { name: 'Planning', value: projects?.filter(p => p.status === 'pending').length || 0, color: '#f59e0b' }
            ]
          }
        };

        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading, error };
};
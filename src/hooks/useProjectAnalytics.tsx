import { useState, useEffect } from 'react';
import { useProjects, Project, Task } from './useProjects';

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

export const useProjectAnalytics = () => {
  const { projects, tasks, loading } = useProjects();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const calculateAnalytics = () => {
    if (!projects.length) {
      setAnalytics(null);
      return;
    }

    const now = new Date();
    
    // Project analytics
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const overdueProjects = projects.filter(p => {
      return p.deadline && new Date(p.deadline) < now && p.status !== 'completed';
    }).length;
    const onTrackProjects = activeProjects - overdueProjects;

    // Task analytics
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const overdueTasks = tasks.filter(t => {
      return t.due_date && new Date(t.due_date) < now && t.status !== 'completed';
    }).length;

    // Time analytics
    const totalHours = projects.reduce((sum, p) => sum + (p.total_hours_logged || 0), 0);
    const billableHours = totalHours * 0.8; // Assume 80% billable
    const averageHoursPerProject = projects.length ? totalHours / projects.length : 0;
    const efficiency = totalHours > 0 ? 85 : 0; // Mock efficiency percentage

    // Budget analytics
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const spent = totalBudget * 0.65; // Assume 65% spent
    const remaining = totalBudget - spent;
    const roi = totalBudget ? (spent / totalBudget) * 100 : 0;

    // Generate trends data (mock for now, could be enhanced with historical data)
    const projectsOverTime = [
      { month: 'Jan', projects: 12, tasks: 85 },
      { month: 'Feb', projects: 15, tasks: 102 },
      { month: 'Mar', projects: 18, tasks: 124 },
      { month: 'Apr', projects: 22, tasks: 145 },
      { month: 'May', projects: 25, tasks: 156 },
      { month: 'Jun', projects: projects.length, tasks: tasks.length },
    ];

    const timeUtilization = [
      { week: 'Week 1', hours: 38, efficiency: 85 },
      { week: 'Week 2', hours: 42, efficiency: 92 },
      { week: 'Week 3', hours: 35, efficiency: 78 },
      { week: 'Week 4', hours: 40, efficiency: 88 },
    ];

    // Team productivity (mock data)
    const teamProductivity = [
      { name: 'John Doe', hours: 45, tasks: 12 },
      { name: 'Jane Smith', hours: 38, tasks: 9 },
      { name: 'Mike Johnson', hours: 42, tasks: 11 },
      { name: 'Sarah Wilson', hours: 35, tasks: 8 },
    ];

    // Project status distribution
    const statusCounts = {
      pending: projects.filter(p => p.status === 'pending').length,
      in_progress: activeProjects,
      completed: completedProjects,
      on_hold: projects.filter(p => p.status === 'on_hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
    };

    const projectStatus = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
        color: getStatusColor(name),
      }));

    setAnalytics({
      projects: {
        total: projects.length,
        active: activeProjects,
        completed: completedProjects,
        overdue: overdueProjects,
        onTrack: onTrackProjects,
      },
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
      },
      time: {
        totalHours,
        billableHours,
        averageHoursPerProject,
        efficiency,
      },
      budget: {
        totalBudget,
        spent,
        remaining,
        roi,
      },
      trends: {
        projectsOverTime,
        timeUtilization,
      },
      performance: {
        teamProductivity,
        projectStatus,
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'on_hold': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    calculateAnalytics();
  }, [projects, tasks]);

  return {
    analytics,
    loading,
  };
};
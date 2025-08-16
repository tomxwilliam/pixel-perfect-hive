import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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

interface ProjectCalendarViewProps {
  projects: ProjectWithDetails[];
}

export const ProjectCalendarView: React.FC<ProjectCalendarViewProps> = ({ projects }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getProjectsForDate = (date: Date) => {
    return projects.filter(project => {
      if (!project.deadline) return false;
      return isSameDay(new Date(project.deadline), date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  // Get all days in the current month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Project Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
              Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
              Week
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(selectedDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5" />
                <span>Project Deadlines</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                  const dayProjects = getProjectsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors
                        ${isToday ? 'bg-primary/10 border-primary' : 'border-border'}
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayProjects.slice(0, 2).map(project => (
                          <div
                            key={project.id}
                            className={`text-xs p-1 rounded border-l-2 bg-muted/50 ${getPriorityColor(project.priority || 'medium')}`}
                          >
                            <div className="font-medium line-clamp-1">{project.title}</div>
                            <div className={`w-1 h-1 rounded-full inline-block mr-1 ${getStatusColor(project.status)}`} />
                            <span className="capitalize">{project.status.replace('_', ' ')}</span>
                          </div>
                        ))}
                        {dayProjects.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayProjects.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, 'MMM dd, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getProjectsForDate(selectedDate).length > 0 ? (
                  getProjectsForDate(selectedDate).map(project => (
                    <div key={project.id} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{project.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {project.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {project.customer?.company_name || 
                          `${project.customer?.first_name || ''} ${project.customer?.last_name || ''}`.trim()}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                          <span className="capitalize">{project.status.replace('_', ' ')}</span>
                        </div>
                        <span>{project.completion_percentage || 0}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    No project deadlines on this date
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Due This Week</span>
                <span className="font-medium">
                  {projects.filter(p => {
                    if (!p.deadline) return false;
                    const deadline = new Date(p.deadline);
                    const weekStart = new Date();
                    const weekEnd = new Date();
                    weekEnd.setDate(weekStart.getDate() + 7);
                    return deadline >= weekStart && deadline <= weekEnd;
                  }).length}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Overdue</span>
                <span className="font-medium text-red-600">
                  {projects.filter(p => {
                    if (!p.deadline) return false;
                    return new Date(p.deadline) < new Date() && p.status !== 'completed';
                  }).length}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>At Risk</span>
                <span className="font-medium text-yellow-600">
                  {projects.filter(p => p.risk_level === 'high').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
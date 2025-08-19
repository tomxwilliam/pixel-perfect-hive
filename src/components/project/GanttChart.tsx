import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from 'date-fns';

interface Task {
  id: string;
  title: string;
  start_date?: string;
  due_date?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  progress?: number;
}

interface Project {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
  tasks?: Task[];
}

interface GanttChartProps {
  projects: Project[];
  startDate?: Date;
  endDate?: Date;
}

const GanttChart: React.FC<GanttChartProps> = ({ 
  projects, 
  startDate = startOfMonth(new Date()), 
  endDate = endOfMonth(addDays(new Date(), 90))
}) => {
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const dayWidth = Math.max(30, Math.min(50, 800 / totalDays));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-orange-500';
      case 'todo': return 'bg-gray-400';
      case 'active': return 'bg-blue-500';
      case 'planning': return 'bg-purple-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'border-l-red-600';
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-yellow-400';
      case 'low': return 'border-l-green-400';
      case 'lowest': return 'border-l-green-600';
      default: return 'border-l-gray-400';
    }
  };

  const calculatePosition = (start: string, end: string) => {
    const startPos = differenceInDays(new Date(start), startDate);
    const duration = differenceInDays(new Date(end), new Date(start)) + 1;
    
    return {
      left: Math.max(0, startPos * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
    };
  };

  const timelineHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i < totalDays; i += 7) {
      const date = addDays(startDate, i);
      headers.push(date);
    }
    return headers;
  }, [startDate, totalDays]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Gantt Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Timeline Header */}
          <div className="relative mb-4 pb-2 border-b">
            <div className="flex" style={{ minWidth: totalDays * dayWidth }}>
              {timelineHeaders.map((date, index) => (
                <div
                  key={index}
                  className="text-xs text-muted-foreground font-medium"
                  style={{ width: dayWidth * 7, minWidth: dayWidth * 7 }}
                >
                  {format(date, 'MMM dd')}
                </div>
              ))}
            </div>
          </div>

          {/* Projects and Tasks */}
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                {/* Project Row */}
                <div className="flex items-center space-y-0">
                  <div className="w-64 pr-4 py-2">
                    <h4 className="font-medium text-sm">{project.title}</h4>
                    <p className="text-xs text-muted-foreground">Project</p>
                  </div>
                  <div className="flex-1 relative" style={{ minWidth: totalDays * dayWidth }}>
                    {project.start_date && project.end_date && (
                      <div
                        className="absolute top-1 h-6 bg-primary/20 border-l-4 border-l-primary rounded flex items-center px-2"
                        style={calculatePosition(project.start_date, project.end_date)}
                      >
                        <span className="text-xs font-medium truncate">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Rows */}
                {project.tasks?.map((task) => (
                  <div key={task.id} className="flex items-center">
                    <div className="w-64 pr-4 py-1 pl-4">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm">{task.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.assigned_to && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {task.assigned_to}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 relative" style={{ minWidth: totalDays * dayWidth }}>
                      {task.start_date && task.due_date && (
                        <div
                          className={`absolute top-1 h-4 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} border-l-2 rounded-sm flex items-center px-1`}
                          style={calculatePosition(task.start_date, task.due_date)}
                        >
                          {task.progress !== undefined && (
                            <div 
                              className="absolute top-0 left-0 h-full bg-green-400 opacity-30 rounded-sm"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                          <Clock className="h-3 w-3 text-white opacity-75" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Active/In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span>Todo/Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>On Hold</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
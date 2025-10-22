import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit3, Trash2, Link, Calendar, Clock, Target } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: string;
  assignee: string;
  progress: number;
  dependencies: string[];
  project_id: string;
  estimated_hours?: number;
  actual_hours?: number;
}

interface Project {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

interface InteractiveGanttChartProps {
  projects: Project[];
  startDate?: Date;
  endDate?: Date;
}

const InteractiveGanttChart: React.FC<InteractiveGanttChartProps> = ({
  projects,
  startDate,
  endDate
}) => {
  const { updateTask, createTask } = useProjects();
  const { toast } = useToast();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizingTask, setResizingTask] = useState<{ task: Task; side: 'left' | 'right' } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskDialog, setNewTaskDialog] = useState<{ projectId: string; date: Date } | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    const allDates = projects.flatMap(p => 
      [p.startDate, p.endDate, ...p.tasks.flatMap(t => [t.startDate, t.endDate])]
    );
    
    const minDate = startDate || new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = endDate || new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding
    const paddedStart = new Date(minDate);
    paddedStart.setDate(paddedStart.getDate() - 7);
    const paddedEnd = new Date(maxDate);
    paddedEnd.setDate(paddedEnd.getDate() + 7);
    
    return { start: paddedStart, end: paddedEnd };
  }, [projects, startDate, endDate]);

  const totalDays = differenceInDays(timelineBounds.end, timelineBounds.start);
  const dayWidth = 40; // pixels per day
  const timelineWidth = totalDays * dayWidth;

  // Generate timeline headers (weeks)
  const timelineHeaders = useMemo(() => {
    const headers = [];
    let currentDate = new Date(timelineBounds.start);
    
    while (currentDate <= timelineBounds.end) {
      headers.push(new Date(currentDate));
      currentDate = addDays(currentDate, 7);
    }
    
    return headers;
  }, [timelineBounds]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'todo': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': case 'critical': return 'border-l-red-600';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-green-500';
      case 'lowest': return 'border-l-gray-400';
      default: return 'border-l-gray-400';
    }
  };

  const calculatePosition = (startDate: Date, endDate: Date) => {
    const startDays = differenceInDays(startDate, timelineBounds.start);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: Math.max(0, startDays * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth)
    };
  };

  const dateFromPosition = (x: number): Date => {
    const days = Math.floor(x / dayWidth);
    return addDays(timelineBounds.start, days);
  };

  const handleTaskEdit = async (task: Task, updates: Partial<Task>) => {
    try {
      await updateTask(task.id, {
        title: updates.title,
        start_date: updates.startDate?.toISOString().split('T')[0],
        due_date: updates.endDate?.toISOString().split('T')[0],
        estimated_hours: updates.estimated_hours,
        actual_hours: updates.actual_hours
      });
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const timelineRect = timelineRef.current?.getBoundingClientRect();
    if (!timelineRect) return;

    setDragOffset(e.clientX - rect.left);
    setDraggedTask(task);
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggedTask || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left - dragOffset;
    const newStartDate = dateFromPosition(x);
    const duration = differenceInDays(draggedTask.endDate, draggedTask.startDate);
    const newEndDate = addDays(newStartDate, duration);

    // Update task position visually (optimistic update)
    const taskElement = document.querySelector(`[data-task-id="${draggedTask.id}"]`) as HTMLElement;
    if (taskElement) {
      const position = calculatePosition(newStartDate, newEndDate);
      taskElement.style.left = `${position.left}px`;
    }
  }, [draggedTask, dragOffset]);

  const handleDragEnd = useCallback(async (e: MouseEvent) => {
    if (!draggedTask || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left - dragOffset;
    const newStartDate = dateFromPosition(x);
    const duration = differenceInDays(draggedTask.endDate, draggedTask.startDate);
    const newEndDate = addDays(newStartDate, duration);

    await handleTaskEdit(draggedTask, {
      ...draggedTask,
      startDate: newStartDate,
      endDate: newEndDate
    });

    setDraggedTask(null);
  }, [draggedTask, dragOffset, handleTaskEdit]);

  const handleResizeStart = (e: React.MouseEvent, task: Task, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setResizingTask({ task, side });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingTask || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;
    const newDate = dateFromPosition(x);

    const taskElement = document.querySelector(`[data-task-id="${resizingTask.task.id}"]`) as HTMLElement;
    if (!taskElement) return;

    let newStartDate = resizingTask.task.startDate;
    let newEndDate = resizingTask.task.endDate;

    if (resizingTask.side === 'left') {
      newStartDate = newDate;
      if (newStartDate >= newEndDate) {
        newStartDate = addDays(newEndDate, -1);
      }
    } else {
      newEndDate = newDate;
      if (newEndDate <= newStartDate) {
        newEndDate = addDays(newStartDate, 1);
      }
    }

    const position = calculatePosition(newStartDate, newEndDate);
    taskElement.style.left = `${position.left}px`;
    taskElement.style.width = `${position.width}px`;
  }, [resizingTask]);

  const handleResizeEnd = useCallback(async (e: MouseEvent) => {
    if (!resizingTask || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;
    const newDate = dateFromPosition(x);

    let newStartDate = resizingTask.task.startDate;
    let newEndDate = resizingTask.task.endDate;

    if (resizingTask.side === 'left') {
      newStartDate = newDate;
      if (newStartDate >= newEndDate) {
        newStartDate = addDays(newEndDate, -1);
      }
    } else {
      newEndDate = newDate;
      if (newEndDate <= newStartDate) {
        newEndDate = addDays(newStartDate, 1);
      }
    }

    await handleTaskEdit(resizingTask.task, {
      ...resizingTask.task,
      startDate: newStartDate,
      endDate: newEndDate
    });

    setResizingTask(null);
  }, [resizingTask, handleTaskEdit]);

  // Global mouse event handlers
  React.useEffect(() => {
    if (draggedTask) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggedTask, handleDragMove, handleDragEnd]);

  React.useEffect(() => {
    if (resizingTask) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingTask, handleResizeMove, handleResizeEnd]);

  const handleTimelineClick = (e: React.MouseEvent, projectId: string) => {
    if (!timelineRef.current) return;
    
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - timelineRect.left;
    const clickDate = dateFromPosition(x);
    
    setNewTaskDialog({ projectId, date: clickDate });
  };

  const handleCreateTask = async (title: string, projectId: string, startDate: Date) => {
    try {
      const endDate = addDays(startDate, 3); // Default 3-day duration
      
      await createTask({
        project_id: projectId,
        title,
        start_date: startDate.toISOString().split('T')[0],
        due_date: endDate.toISOString().split('T')[0],
        status: 'todo',
        priority: 'medium',
        estimated_hours: 8
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      setNewTaskDialog(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task", 
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Interactive Gantt Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto overflow-y-auto max-h-[400px] md:max-h-[600px]">
          {/* Timeline Header */}
          <div className="flex sticky top-0 bg-background z-10 border-b">
            <div className="w-64 p-3 font-medium border-r bg-muted">
              Project / Task
            </div>
            <div className="flex" style={{ width: timelineWidth }}>
              {timelineHeaders.map((date, index) => (
                <div
                  key={index}
                  className="border-r p-2 text-xs text-center bg-muted"
                  style={{ width: dayWidth * 7 }}
                >
                  <div className="font-medium">{format(date, 'MMM dd')}</div>
                  <div className="text-muted-foreground">{format(date, 'yyyy')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects and Tasks */}
          <div ref={timelineRef} className="relative">
            {projects.map((project) => (
              <div key={project.id}>
                {/* Project Row */}
                <div className="flex border-b hover:bg-muted/50">
                  <div className="w-64 p-3 border-r">
                    <div className="font-medium text-primary">{project.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(project.startDate, 'MMM dd')} - {format(project.endDate, 'MMM dd')}
                    </div>
                  </div>
                  <div 
                    className="relative flex-1 p-2 cursor-pointer"
                    style={{ width: timelineWidth }}
                    onClick={(e) => handleTimelineClick(e, project.id)}
                  >
                    {/* Project Timeline Bar */}
                    <div
                      className="absolute top-3 h-6 bg-primary/20 border border-primary/40 rounded flex items-center px-2"
                      style={calculatePosition(project.startDate, project.endDate)}
                    >
                      <span className="text-xs font-medium text-primary truncate">
                        {project.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task Rows */}
                {project.tasks.map((task) => (
                  <div key={task.id} className="flex border-b hover:bg-muted/50">
                    <div className="w-64 p-3 border-r">
                      {editingTask?.id === task.id ? (
                        <Input
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                          onBlur={() => {
                            handleTaskEdit(task, editingTask);
                            setEditingTask(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleTaskEdit(task, editingTask);
                              setEditingTask(null);
                            }
                            if (e.key === 'Escape') {
                              setEditingTask(null);
                            }
                          }}
                          className="text-sm"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer"
                          onDoubleClick={() => setEditingTask(task)}
                        >
                          <div className="font-medium text-sm">{task.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)} text-white`}>
                              {task.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.estimated_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.actual_hours || 0}h / {task.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div 
                      className="relative flex-1 p-2"
                      style={{ width: timelineWidth }}
                    >
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div
                            data-task-id={task.id}
                            className={`absolute top-2 h-8 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} border-l-4 rounded cursor-move hover:shadow-md transition-shadow group`}
                            style={calculatePosition(task.startDate, task.endDate)}
                            onMouseDown={(e) => handleDragStart(e, task)}
                          >
                            {/* Resize Handle - Left */}
                            <div
                              className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/40"
                              onMouseDown={(e) => handleResizeStart(e, task, 'left')}
                            />
                            
                            {/* Task Content */}
                            <div className="flex items-center justify-between h-full px-2 text-white text-xs">
                              <span className="truncate font-medium">{task.title}</span>
                              <span>{task.progress}%</span>
                            </div>
                            
                            {/* Resize Handle - Right */}
                            <div
                              className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/40"
                              onMouseDown={(e) => handleResizeStart(e, task, 'right')}
                            />
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => setEditingTask(task)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Task
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Link className="h-4 w-4 mr-2" />
                            Add Dependency
                          </ContextMenuItem>
                          <ContextMenuItem>
                            <Target className="h-4 w-4 mr-2" />
                            Set Milestone
                          </ContextMenuItem>
                          <ContextMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Create Task Dialog */}
        <Dialog open={!!newTaskDialog} onOpenChange={() => setNewTaskDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  placeholder="Enter task title..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleCreateTask(
                        e.currentTarget.value.trim(),
                        newTaskDialog!.projectId,
                        newTaskDialog!.date
                      );
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Start Date: {newTaskDialog && format(newTaskDialog.date, 'MMM dd, yyyy')}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewTaskDialog(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter task title..."]') as HTMLInputElement;
                  if (input?.value.trim()) {
                    handleCreateTask(
                      input.value.trim(),
                      newTaskDialog!.projectId,
                      newTaskDialog!.date
                    );
                  }
                }}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InteractiveGanttChart;
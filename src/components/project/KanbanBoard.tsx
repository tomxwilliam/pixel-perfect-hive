import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjects, Task } from '@/hooks/useProjects';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateTaskForm from './forms/CreateTaskForm';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-gray-100 dark:bg-gray-800',
    tasks: []
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'bg-blue-100 dark:bg-blue-800',
    tasks: []
  },
  {
    id: 'review',
    title: 'In Review',
    color: 'bg-orange-100 dark:bg-orange-800',
    tasks: []
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'bg-green-100 dark:bg-green-800',
    tasks: []
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'highest': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    case 'lowest': return 'outline';
    default: return 'default';
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const KanbanBoard = () => {
  const { tasks, projects, updateTask } = useProjects();
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Organize tasks into columns
  useEffect(() => {
    const tasksByStatus = tasks.reduce((acc, task) => {
      const status = task.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const updatedColumns = initialColumns.map(col => ({
      ...col,
      tasks: tasksByStatus[col.id] || []
    }));

    setColumns(updatedColumns);
  }, [tasks]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const sourceTask = sourceColumn.tasks[source.index];

    // Update task status in database if moving between columns
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as Task['status'];
      await updateTask(sourceTask.id, { status: newStatus });
    }

    // Optimistically update local state for smooth UX
    const newSourceTasks = Array.from(sourceColumn.tasks);
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = Array.from(destColumn.tasks);
    newDestTasks.splice(destination.index, 0, {
      ...sourceTask,
      status: destination.droppableId as Task['status']
    });

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: newSourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: newDestTasks };
      }
      return col;
    });

    setColumns(newColumns);
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kanban Board</h2>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card className="h-full">
                <CardHeader className={`pb-3 ${column.color} rounded-t-lg`}>
                  <CardTitle className="flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 space-y-3 min-h-[500px] ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm leading-5 line-clamp-2">
                                        {task.title}
                                      </h4>
                                      <Badge variant={getPriorityColor(task.priority)} className="ml-2 text-xs">
                                        {task.priority}
                                      </Badge>
                                    </div>

                                     {/* Description */}
                                     {task.description && (
                                       <p className="text-xs text-muted-foreground line-clamp-2">
                                         {task.description}
                                       </p>
                                     )}

                                     {/* Due Date */}
                                     {task.due_date && (
                                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                         <Calendar className="h-3 w-3" />
                                         {new Date(task.due_date).toLocaleDateString()}
                                       </div>
                                     )}

                                     {/* Time Tracking */}
                                     {(task.estimated_hours || task.actual_hours) && (
                                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                         <Clock className="h-3 w-3" />
                                         {task.actual_hours || 0}h / {task.estimated_hours || 0}h
                                       </div>
                                     )}

                                     {/* Footer */}
                                     <div className="flex items-center justify-between pt-2">
                                       {/* Assignee */}
                                       {task.assignee_id && (
                                         <Avatar className="h-6 w-6">
                                           <AvatarFallback className="text-xs">
                                             A
                                           </AvatarFallback>
                                         </Avatar>
                                       )}

                                       {/* Created date */}
                                       <div className="text-xs text-muted-foreground">
                                         {new Date(task.created_at).toLocaleDateString()}
                                       </div>
                                     </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add task button */}
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed"
                        onClick={() => setShowCreateTask(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <CreateTaskForm 
            projectId=""
            onSuccess={() => setShowCreateTask(false)}
            onCancel={() => setShowCreateTask(false)}
            availableProjects={projects.map(p => ({ id: p.id, title: p.title }))}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
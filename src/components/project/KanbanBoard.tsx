import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  dueDate?: string;
  tags?: string[];
  comments?: number;
  attachments?: number;
  estimatedHours?: number;
  actualHours?: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

const initialData: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-gray-100 dark:bg-gray-800',
    tasks: [
      {
        id: 'task-1',
        title: 'Setup payment gateway',
        description: 'Integrate Stripe payment processing',
        assignee: 'Mike Johnson',
        priority: 'high',
        dueDate: '2024-11-30',
        tags: ['backend', 'payment'],
        comments: 2,
        attachments: 1,
        estimatedHours: 8
      },
      {
        id: 'task-2',
        title: 'Database optimization',
        description: 'Optimize database queries for better performance',
        assignee: 'Alex Chen',
        priority: 'medium',
        dueDate: '2024-12-05',
        tags: ['database', 'performance'],
        comments: 0,
        attachments: 0,
        estimatedHours: 12
      }
    ]
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'bg-blue-100 dark:bg-blue-800',
    tasks: [
      {
        id: 'task-3',
        title: 'User authentication system',
        description: 'Implement secure user login and registration',
        assignee: 'John Doe',
        priority: 'highest',
        dueDate: '2024-11-25',
        tags: ['auth', 'security'],
        comments: 5,
        attachments: 2,
        estimatedHours: 16,
        actualHours: 8
      }
    ]
  },
  {
    id: 'review',
    title: 'In Review',
    color: 'bg-orange-100 dark:bg-orange-800',
    tasks: [
      {
        id: 'task-4',
        title: 'Homepage redesign',
        description: 'Create new homepage design mockups',
        assignee: 'Sarah Wilson',
        priority: 'medium',
        dueDate: '2024-11-22',
        tags: ['design', 'ui'],
        comments: 3,
        attachments: 5,
        estimatedHours: 20,
        actualHours: 18
      }
    ]
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'bg-green-100 dark:bg-green-800',
    tasks: [
      {
        id: 'task-5',
        title: 'Project setup',
        description: 'Initialize project structure and dependencies',
        assignee: 'Jane Smith',
        priority: 'high',
        dueDate: '2024-11-15',
        tags: ['setup', 'infrastructure'],
        comments: 1,
        attachments: 0,
        estimatedHours: 4,
        actualHours: 3
      }
    ]
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
  const [columns, setColumns] = useState<Column[]>(initialData);

  const onDragEnd = (result: any) => {
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

    // Remove task from source column
    const newSourceTasks = Array.from(sourceColumn.tasks);
    newSourceTasks.splice(source.index, 1);

    // Add task to destination column
    const newDestTasks = Array.from(destColumn.tasks);
    newDestTasks.splice(destination.index, 0, sourceTask);

    // Update columns
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
        <Button>
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

                                    {/* Tags */}
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {task.tags.map((tag, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Due Date */}
                                    {task.dueDate && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </div>
                                    )}

                                    {/* Time Tracking */}
                                    {(task.estimatedHours || task.actualHours) && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {task.actualHours ? `${task.actualHours}h` : '0h'} / {task.estimatedHours}h
                                      </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2">
                                      {/* Assignee */}
                                      {task.assignee && (
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs">
                                            {getInitials(task.assignee)}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}

                                      {/* Metadata */}
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {task.comments !== undefined && task.comments > 0 && (
                                          <div className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {task.comments}
                                          </div>
                                        )}
                                        {task.attachments !== undefined && task.attachments > 0 && (
                                          <div className="flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            {task.attachments}
                                          </div>
                                        )}
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
                        onClick={() => console.log(`Add task to ${column.title}`)}
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
    </div>
  );
};

export default KanbanBoard;
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  MoreHorizontal,
  User,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    assignee?: string;
    priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
    status: string;
    dueDate?: string;
    tags?: string[];
    comments?: number;
    attachments?: number;
    estimatedHours?: number;
    actualHours?: number;
  };
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

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

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'highest': return <Flag className="h-3 w-3 text-red-600" />;
    case 'high': return <Flag className="h-3 w-3 text-orange-600" />;
    case 'medium': return <Flag className="h-3 w-3 text-yellow-600" />;
    case 'low': return <Flag className="h-3 w-3 text-green-600" />;
    case 'lowest': return <Flag className="h-3 w-3 text-gray-400" />;
    default: return <Flag className="h-3 w-3 text-gray-400" />;
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  className = "" 
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-all group ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-5 line-clamp-2 flex-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              {getPriorityIcon(task.priority)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(task.id)}
                    className="text-destructive"
                  >
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
              {task.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs h-5">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="outline" className="text-xs h-5">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {task.actualHours ? `${task.actualHours}h` : '0h'} / {task.estimatedHours || 0}h
              </span>
            </div>
          )}

          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(task.priority)} className="text-xs h-5">
              {task.priority}
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            {/* Assignee */}
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assignee)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              {task.assignee && (
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {task.assignee.split(' ')[0]}
                </span>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.comments !== undefined && task.comments > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.comments}</span>
                </div>
              )}
              {task.attachments !== undefined && task.attachments > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
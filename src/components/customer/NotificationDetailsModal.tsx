import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  Eye, 
  MessageSquare, 
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type Notification = Tables<'notifications'>;

interface NotificationDetailsModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationUpdated: () => void;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  open,
  onOpenChange,
  onNotificationUpdated,
}) => {
  const { toast } = useToast();

  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info': 
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ticket': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'invoice': return 'bg-green-100 text-green-800 border-green-200';
      case 'quote': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'domain': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'hosting': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': 
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const markAsRead = async () => {
    if (notification.read) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      if (error) throw error;

      toast({
        title: 'Notification marked as read',
        description: 'This notification has been marked as read.',
      });

      onNotificationUpdated();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    }
  };

  const handleActionClick = () => {
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Details
          </DialogTitle>
          <DialogDescription>
            Complete notification information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{notification.title}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className={getCategoryColor(notification.category)}>
                      {notification.category.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(notification.type)}>
                      {notification.type.toUpperCase()}
                    </Badge>
                    {!notification.read && (
                      <Badge variant="destructive">
                        UNREAD
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Content */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Metadata */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Notification Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">{formatFullDate(notification.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Time ago:</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at))} ago
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span className={notification.read ? 'text-green-600' : 'text-orange-600'}>
                    {notification.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                {notification.created_by && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">From:</span>
                    <span className="text-muted-foreground">Admin Team</span>
                  </div>
                )}
                {notification.related_id && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Related ID:</span>
                    <span className="text-muted-foreground font-mono text-sm">
                      #{notification.related_id.split('-')[0]}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="flex gap-3">
                {notification.action_url && (
                  <Button 
                    onClick={handleActionClick}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Related Item
                  </Button>
                )}
                {!notification.read && (
                  <Button 
                    variant="outline"
                    onClick={markAsRead}
                    className={notification.action_url ? "flex-1" : "w-full"}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
              {notification.read && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  This notification has been read.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
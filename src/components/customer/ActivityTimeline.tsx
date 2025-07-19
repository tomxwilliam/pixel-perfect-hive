import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  User, 
  FileText, 
  FolderOpen, 
  Ticket, 
  CreditCard,
  Clock,
  Edit,
  Plus,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type ActivityLog = Tables<'activity_log'>;

interface ActivityWithActor extends ActivityLog {
  actor?: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
}

export const ActivityTimeline = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Real-time subscription for new activities
    const channel = supabase
      .channel('user-activities')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log', filter: `user_id=eq.${user?.id}` },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'project': return <FolderOpen className="h-4 w-4" />;
      case 'ticket': return <Ticket className="h-4 w-4" />;
      case 'invoice': return <CreditCard className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="h-3 w-3 text-green-600" />;
      case 'updated': return <Edit className="h-3 w-3 text-blue-600" />;
      case 'deleted': return <Trash2 className="h-3 w-3 text-red-600" />;
      case 'status_changed': return <Edit className="h-3 w-3 text-purple-600" />;
      default: return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'ticket': return 'bg-orange-100 text-orange-800';
      case 'invoice': return 'bg-green-100 text-green-800';
      case 'quote': return 'bg-purple-100 text-purple-800';
      case 'message': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          Track all changes and updates to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Your project activities will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      {getEntityIcon(activity.entity_type)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2"></div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getActionIcon(activity.action)}
                          <h4 className="font-medium">{activity.description}</h4>
                          <Badge variant="outline" className={getEntityColor(activity.entity_type)}>
                            {activity.entity_type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(activity.created_at))} ago
                          </div>
                           {activity.actor_id && (
                             <div className="flex items-center">
                               <User className="h-3 w-3 mr-1" />
                               Admin Action
                             </div>
                           )}
                        </div>

                        {/* Show changed values for updates */}
                        {activity.action === 'updated' && activity.old_values && activity.new_values && (
                          <div className="mt-3 p-3 bg-muted rounded text-sm">
                            <div className="font-medium mb-2">Changes:</div>
                            {Object.entries(activity.new_values as Record<string, any>).map(([key, newValue]) => {
                              const oldValue = (activity.old_values as Record<string, any>)?.[key];
                              if (oldValue !== newValue) {
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <span className="font-medium">{key}:</span>
                                    <span className="text-red-600 line-through">{String(oldValue)}</span>
                                    <span>→</span>
                                    <span className="text-green-600">{String(newValue)}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
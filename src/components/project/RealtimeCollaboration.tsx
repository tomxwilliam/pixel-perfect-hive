import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageCircle, 
  Activity, 
  Send, 
  Eye,
  MousePointer,
  Clock
} from 'lucide-react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeCollaborationProps {
  projectId: string;
  onUserClick?: (userId: string) => void;
}

const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  projectId,
  onUserClick
}) => {
  const { onlineUsers, liveComments, liveUpdates, sendComment } = useRealtimeCollaboration(projectId);
  const [newComment, setNewComment] = useState('');

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    await sendComment(newComment);
    setNewComment('');
  };

  const getStatusColor = (user: any) => {
    const lastSeen = new Date(user.online_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    if (diffMinutes < 2) return 'bg-green-500';
    if (diffMinutes < 10) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Online Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Online Users ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div 
                key={user.user_id}
                className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onUserClick?.(user.user_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(user)}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.user_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {user.current_task ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Working on task
                        </>
                      ) : (
                        <>
                          <MousePointer className="h-3 w-3" />
                          Viewing project
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(user.online_at), { addSuffix: true })}
                </div>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No users currently online
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Comments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {liveComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm">{comment.content}</div>
                    {comment.mentions && comment.mentions.length > 0 && (
                      <div className="flex gap-1">
                        {comment.mentions.map((mention) => (
                          <Badge key={mention} variant="secondary" className="text-xs">
                            @{mention}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {liveComments.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No comments yet. Start a conversation!
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          <div className="flex gap-2">
            <Input
              placeholder="Type a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <Button 
              size="sm" 
              onClick={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {liveUpdates.map((update) => (
                <div key={update.id} className="flex items-center gap-3 p-2 rounded border-l-2 border-primary/20">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm">
                      <span className="font-medium">{update.user_name}</span>
                      {' '}
                      <span className="text-muted-foreground">
                        {update.type.replace('_', ' ')}
                      </span>
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
              {liveUpdates.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No recent activity
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeCollaboration;
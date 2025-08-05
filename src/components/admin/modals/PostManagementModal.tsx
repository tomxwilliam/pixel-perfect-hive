import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  BarChart3, 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye,
  Twitter,
  Linkedin,
  ExternalLink,
  Clock
} from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  scheduled_for?: string;
  posted_at?: string;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  engagement_views: number;
  post_url?: string;
  character_count: number;
  ai_generated: boolean;
}

interface PostManagementModalProps {
  post: SocialPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: () => void;
  onEditPost?: (post: SocialPost) => void;
}

export function PostManagementModal({ 
  post, 
  open, 
  onOpenChange, 
  onPostUpdated,
  onEditPost 
}: PostManagementModalProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDeletePost = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      onPostUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusInfo = () => {
    if (post.posted_at) {
      return {
        status: 'Published',
        variant: 'default' as const,
        time: new Date(post.posted_at).toLocaleString()
      };
    } else if (post.scheduled_for) {
      return {
        status: 'Scheduled',
        variant: 'secondary' as const,
        time: new Date(post.scheduled_for).toLocaleString()
      };
    } else {
      return {
        status: 'Draft',
        variant: 'outline' as const,
        time: 'Not scheduled'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const totalEngagement = post.engagement_likes + post.engagement_comments + post.engagement_shares;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Post Management
            </DialogTitle>
            <DialogDescription>
              View post details, engagement metrics, and manage post actions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-2">
                  {getPlatformIcon(post.platform)}
                  {post.platform}
                </Badge>
                <Badge variant={statusInfo.variant}>
                  {statusInfo.status}
                </Badge>
                {post.ai_generated && (
                  <Badge variant="secondary">AI Generated</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {onEditPost && (
                  <Button variant="outline" size="sm" onClick={() => onEditPost(post)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-3">
              <h4 className="font-medium">Content</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {post.character_count} characters
                </p>
              </div>
            </div>

            {/* Timing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timing
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Status:</span> {statusInfo.status}</p>
                  <p><span className="font-medium">Time:</span> {statusInfo.time}</p>
                </div>
              </div>

              {post.post_url && (
                <div className="space-y-2">
                  <h4 className="font-medium">Post Link</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on {post.platform}
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Engagement Metrics */}
            {post.posted_at && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Engagement Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Likes</span>
                    </div>
                    <p className="text-xl font-bold">{post.engagement_likes}</p>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Comments</span>
                    </div>
                    <p className="text-xl font-bold">{post.engagement_comments}</p>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Shares</span>
                    </div>
                    <p className="text-xl font-bold">{post.engagement_shares}</p>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Views</span>
                    </div>
                    <p className="text-xl font-bold">{post.engagement_views}</p>
                  </div>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Engagement</p>
                  <p className="text-2xl font-bold">{totalEngagement}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        warningText="This will permanently remove the post and all its engagement data."
        loading={loading}
      />
    </>
  );
}
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Twitter, 
  Linkedin, 
  Clock,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_for: string;
  media_urls?: string[];
  hashtags?: string[];
}

export function SocialMediaCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .not('scheduled_for', 'is', null)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_for);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-3 w-3" />;
      case 'linkedin': return <Linkedin className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setScheduledPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Success",
        description: "Scheduled post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Content Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasPost: (date) => getPostsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasPost: { 
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Posts for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Posts
              </span>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate ? (
              (() => {
                const postsForDate = getPostsForDate(selectedDate);
                return postsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No posts scheduled for this date</p>
                    <Button variant="outline" className="mt-2">
                      Schedule a Post
                    </Button>
                  </div>
                ) : (
                  postsForDate.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            {getPlatformIcon(post.platform)}
                            {post.platform}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(post.scheduled_for)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm line-clamp-3">{post.content}</p>
                      
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((hashtag) => (
                            <Badge key={hashtag} variant="secondary" className="text-xs">
                              #{hashtag}
                            </Badge>
                          ))}
                          {post.hashtags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.hashtags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {post.media_urls && post.media_urls.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          📎 {post.media_urls.length} attachment{post.media_urls.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))
                );
              })()
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a date to view scheduled posts
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledPosts.slice(0, 10).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upcoming posts scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.slice(0, 10).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      {getPlatformIcon(post.platform)}
                      {post.platform}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.scheduled_for).toLocaleDateString()} at {formatTime(post.scheduled_for)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
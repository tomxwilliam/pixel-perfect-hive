import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye,
  Twitter,
  Linkedin,
  Calendar,
  BarChart3,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PostManagementModal } from "../modals/PostManagementModal";

interface SocialAccount {
  id: string;
  platform: string;
  account_username: string;
  account_display_name: string;
  follower_count: number;
  following_count: number;
  is_active: boolean;
}

interface RecentPost {
  id: string;
  platform: string;
  content: string;
  posted_at: string;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  engagement_views: number;
  character_count: number;
  ai_generated: boolean;
  scheduled_for?: string;
  post_url?: string;
}

export function SocialMediaDashboard() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [totalMetrics, setTotalMetrics] = useState({
    followers: 0,
    engagement: 0,
    posts: 0,
    reach: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<RecentPost | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      // Fetch connected accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('is_active', true);

      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      // Fetch recent posts
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;
      setRecentPosts(postsData || []);

      // Calculate total metrics
      const totalFollowers = accountsData?.reduce((sum, acc) => sum + acc.follower_count, 0) || 0;
      const totalEngagement = postsData?.reduce((sum, post) => 
        sum + post.engagement_likes + post.engagement_comments + post.engagement_shares, 0) || 0;
      
      setTotalMetrics({
        followers: totalFollowers,
        engagement: totalEngagement,
        posts: postsData?.length || 0,
        reach: postsData?.reduce((sum, post) => sum + post.engagement_views, 0) || 0
      });

    } catch (error) {
      console.error('Error fetching social data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch social media data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.followers)}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.engagement)}</div>
            <p className="text-xs text-muted-foreground">
              Likes, comments, shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.posts}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.reach)}</div>
            <p className="text-xs text-muted-foreground">
              Views and impressions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No accounts connected</p>
                <Button variant="outline" className="mt-2">
                  Connect Account
                </Button>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <p className="font-medium">{account.account_display_name || account.account_username}</p>
                      <p className="text-sm text-muted-foreground">@{account.account_username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatNumber(account.follower_count)}</p>
                    <p className="text-sm text-muted-foreground">followers</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Posts Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet</p>
                <Button variant="outline" className="mt-2">
                  Create First Post
                </Button>
              </div>
            ) : (
              recentPosts.map((post) => (
                  <div key={post.id} className="p-3 border rounded-lg space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                       onClick={() => { setSelectedPost(post); setPostModalOpen(true); }}>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="gap-1">
                      {getPlatformIcon(post.platform)}
                      {post.platform}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.posted_at).toLocaleDateString()}
                      </p>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.engagement_likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {post.engagement_comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {post.engagement_shares}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.engagement_views}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPost && (
        <PostManagementModal
          post={selectedPost}
          open={postModalOpen}
          onOpenChange={setPostModalOpen}
          onPostUpdated={fetchSocialData}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Twitter, 
  Linkedin, 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostAnalytics {
  id: string;
  platform: string;
  content: string;
  posted_at: string;
  engagement_likes: number;
  engagement_comments: number;
  engagement_shares: number;
  engagement_views: number;
  post_url?: string;
}

export function SocialMediaAnalytics() {
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, platformFilter, dateFilter, searchTerm]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .not('posted_at', 'is', null)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter(post => post.platform === platformFilter);
    }

    // Date filter
    const daysAgo = parseInt(dateFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    filtered = filtered.filter(post => new Date(post.posted_at) >= cutoffDate);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  const getTotalEngagement = (post: PostAnalytics) => {
    return post.engagement_likes + post.engagement_comments + post.engagement_shares;
  };

  const getEngagementRate = (post: PostAnalytics) => {
    const totalEngagement = getTotalEngagement(post);
    return post.engagement_views > 0 ? (totalEngagement / post.engagement_views * 100) : 0;
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

  const calculateTotalMetrics = () => {
    return filteredPosts.reduce((acc, post) => ({
      likes: acc.likes + post.engagement_likes,
      comments: acc.comments + post.engagement_comments,
      shares: acc.shares + post.engagement_shares,
      views: acc.views + post.engagement_views
    }), { likes: 0, comments: 0, shares: 0, views: 0 });
  };

  const totalMetrics = calculateTotalMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Content</label>
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.likes)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPosts.length} posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.comments)}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.shares)}</div>
            <p className="text-xs text-muted-foreground">
              Reshares & retweets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalMetrics.views)}</div>
            <p className="text-xs text-muted-foreground">
              Impressions & reach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Post Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Post Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found for the selected filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getPlatformIcon(post.platform)}
                        {post.platform}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.posted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {getEngagementRate(post).toFixed(1)}% rate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTotalEngagement(post)} total engagement
                      </div>
                    </div>
                  </div>

                  <p className="text-sm line-clamp-2">{post.content}</p>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(post.engagement_likes)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{formatNumber(post.engagement_comments)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Share2 className="h-3 w-3" />
                      <span>{formatNumber(post.engagement_shares)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(post.engagement_views)}</span>
                    </div>
                  </div>

                  {post.post_url && (
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                          View Original Post
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts, useDeleteBlogPost, BlogPost } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { PenSquare, Plus, Search, Trash2, Eye, BarChart3, FolderOpen, Clock, FileText } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import BlogPostEditor from "./forms/BlogPostEditor";
import CategoryManager from "./forms/CategoryManager";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export default function AdminBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const { data: allPosts } = useBlogPosts();
  const { data: publishedPosts } = useBlogPosts({ status: "published" });
  const { data: scheduledPosts } = useBlogPosts({ status: "scheduled" });
  const { data: draftPosts } = useBlogPosts({ status: "draft" });
  const { data: categories } = useBlogCategories();
  const deleteMutation = useDeleteBlogPost();

  const totalViews = allPosts?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

  const handleCreateNew = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeletePostId(null);
  };

  const filteredPosts = allPosts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isEditorOpen) {
    return <BlogPostEditor post={selectedPost} onClose={() => setIsEditorOpen(false)} />;
  }

  if (isCategoryManagerOpen) {
    return <CategoryManager onClose={() => setIsCategoryManagerOpen(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCategoryManagerOpen(true)} variant="outline">
            <FolderOpen className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPosts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPosts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Posts ({allPosts?.length || 0})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedPosts?.length || 0})</TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="h-4 w-4 mr-1" />
            Scheduled ({scheduledPosts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftPosts?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Blog Posts</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPosts?.map((post) => (
                  <PostListItem 
                    key={post.id} 
                    post={post as BlogPost} 
                    onEdit={handleEdit}
                    onDelete={(p) => setDeletePostId(p.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Published Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedPosts?.map((post) => (
                  <PostListItem 
                    key={post.id} 
                    post={post as BlogPost} 
                    onEdit={handleEdit}
                    onDelete={(p) => setDeletePostId(p.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledPosts?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No scheduled posts yet. Create a post and schedule it for future publication.
                  </p>
                ) : (
                  scheduledPosts?.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant="secondary">Scheduled</Badge>
                          {post.blog_categories && (
                            <Badge variant="outline">{post.blog_categories.name}</Badge>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                        )}
                        {post.scheduled_for && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">
                              Publishes: {format(new Date(post.scheduled_for), "PPpp")}
                            </span>
                            <span className="text-muted-foreground">
                              ({formatDistanceToNow(new Date(post.scheduled_for), { addSuffix: true })})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletePostId(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {draftPosts?.map((post) => (
                  <PostListItem 
                    key={post.id} 
                    post={post as BlogPost} 
                    onEdit={handleEdit}
                    onDelete={(p) => setDeletePostId(p.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDeleteDialog
        open={!!deletePostId}
        onOpenChange={(open) => !open && setDeletePostId(null)}
        onConfirm={() => deletePostId && handleDelete(deletePostId)}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
}

function PostListItem({ 
  post, 
  onEdit, 
  onDelete 
}: { 
  post: BlogPost; 
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold">{post.title}</h3>
          <Badge variant={
            post.status === "published" ? "default" : 
            post.status === "scheduled" ? "secondary" : 
            "outline"
          }>
            {post.status}
          </Badge>
          {post.blog_categories && (
            <Badge variant="outline">{post.blog_categories.name}</Badge>
          )}
        </div>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {post.published_at && post.status === "published" && (
            <span>Published: {format(new Date(post.published_at), "MMM d, yyyy")}</span>
          )}
          <span>{post.view_count || 0} views</span>
          {post.read_time_minutes && <span>{post.read_time_minutes} min read</span>}
          {post.auto_published && (
            <Badge variant="outline" className="text-xs">Auto-published</Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(post)}
        >
          <PenSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(post)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

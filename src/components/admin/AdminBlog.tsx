import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBlogPosts, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { PenSquare, Plus, Search, Trash2, Eye, BarChart3, FolderOpen } from "lucide-react";
import { format } from "date-fns";
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
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <PenSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Manage your blog content</CardDescription>
            </div>
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
            {filteredPosts?.map((post: any) => (
              <div key={post.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                    {post.blog_categories && (
                      <Badge variant="outline" style={{ borderColor: post.blog_categories.color }}>
                        {post.blog_categories.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {post.excerpt || "No excerpt"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : "Not published"}</span>
                    <span>{post.view_count || 0} views</span>
                    {post.read_time_minutes && <span>{post.read_time_minutes} min read</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeletePostId(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

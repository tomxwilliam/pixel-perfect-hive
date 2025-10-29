import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { useAuth } from "@/hooks/useAuth";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { slugify, calculateReadTime, generateExcerpt } from "@/utils/slugify";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import { toast } from "sonner";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category_id: z.string().optional(),
  status: z.enum(["draft", "published"]),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface BlogPostEditorProps {
  post?: any;
  onClose: () => void;
}

export default function BlogPostEditor({ post, onClose }: BlogPostEditorProps) {
  const { user } = useAuth();
  const { data: categories } = useBlogCategories();
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const { uploadFile, isUploading } = useFileUpload();
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featured_image_url || null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      category_id: post?.category_id || "",
      status: post?.status || "draft",
      tags: post?.tags?.join(", ") || "",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
    },
  });

  const title = watch("title");
  const content = watch("content");

  useEffect(() => {
    if (title && !post) {
      setValue("slug", slugify(title));
    }
  }, [title, post, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedFile = await uploadFile(file, "blog-images");
    if (uploadedFile) {
      const { data } = supabase.storage.from('uploads').getPublicUrl(uploadedFile.filePath);
      setFeaturedImage(data.publicUrl);
      toast.success("Image uploaded successfully");
    }
  };

  const onSubmit = async (data: PostFormData) => {
    const readTime = calculateReadTime(data.content);
    const excerpt = data.excerpt || generateExcerpt(data.content);
    const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    const postData = {
      ...data,
      excerpt,
      tags,
      read_time_minutes: readTime,
      featured_image_url: featuredImage,
      author_id: user?.id,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };

    if (post) {
      updateMutation.mutate({ id: post.id, ...postData }, {
        onSuccess: onClose,
      });
    } else {
      createMutation.mutate(postData, {
        onSuccess: onClose,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setValue("status", "draft")}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>
            <Eye className="mr-2 h-4 w-4" />
            {post ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" {...register("excerpt")} rows={3} placeholder="Brief description (auto-generated if empty)" />
            </div>

            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select onValueChange={(value) => setValue("category_id", value)} defaultValue={post?.category_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" {...register("tags")} placeholder="react, web development, tutorial" />
            </div>

            <div>
              <Label>Featured Image</Label>
              <div className="space-y-2">
                {featuredImage && (
                  <div className="relative inline-block">
                    <img src={featuredImage} alt="Featured" className="h-32 w-auto rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => setFeaturedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register("content")}
              rows={15}
              placeholder="Write your blog post content here... (HTML supported)"
              className="font-mono"
            />
            {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            {content && (
              <p className="text-sm text-muted-foreground mt-2">
                Estimated read time: {calculateReadTime(content)} minutes
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" {...register("meta_title")} placeholder="Leave empty to use post title" />
            </div>

            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea id="meta_description" {...register("meta_description")} rows={3} placeholder="SEO description for search engines" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue("status", value as "draft" | "published")} defaultValue={post?.status || "draft"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

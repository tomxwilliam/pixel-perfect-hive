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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { useAuth } from "@/hooks/useAuth";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { slugify, calculateReadTime, generateExcerpt } from "@/utils/slugify";
import { ArrowLeft, Save, Eye, Upload, X, CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category_id: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  scheduled_for: z.string().optional(),
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
  const [publishMode, setPublishMode] = useState<"draft" | "immediate" | "scheduled">(
    post?.status === "scheduled" ? "scheduled" : post?.status === "published" ? "immediate" : "draft"
  );
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(
    post?.scheduled_for ? new Date(post.scheduled_for) : undefined
  );
  const [scheduleTime, setScheduleTime] = useState<string>(
    post?.scheduled_for ? format(new Date(post.scheduled_for), "HH:mm") : "09:00"
  );

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

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const onSubmit = async (data: PostFormData) => {
    const readTime = calculateReadTime(data.content);
    const excerpt = data.excerpt || generateExcerpt(data.content);
    const tags = data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    // Determine status and timestamps based on publish mode
    let finalStatus: "draft" | "published" | "scheduled" = "draft";
    let publishedAt: string | null = null;
    let scheduledFor: string | null = null;

    if (publishMode === "immediate") {
      finalStatus = "published";
      publishedAt = new Date().toISOString();
    } else if (publishMode === "scheduled") {
      if (!scheduleDate || !scheduleTime) {
        toast.error("Please select a date and time for scheduling.");
        return;
      }
      
      const scheduledDateTime = combineDateTime(scheduleDate, scheduleTime);
      
      if (scheduledDateTime <= new Date()) {
        toast.error("Scheduled time must be in the future.");
        return;
      }
      
      finalStatus = "scheduled";
      scheduledFor = scheduledDateTime.toISOString();
      publishedAt = scheduledDateTime.toISOString(); // For RLS compatibility
    } else {
      finalStatus = "draft";
    }

    const postData = {
      ...data,
      excerpt,
      tags,
      read_time_minutes: readTime,
      featured_image_url: featuredImage,
      author_id: user?.id,
      status: finalStatus,
      published_at: publishedAt,
      scheduled_for: scheduledFor,
      // Fix: Convert empty string to null for UUID fields
      category_id: data.category_id && data.category_id !== "" ? data.category_id : null,
    };

    if (post) {
      updateMutation.mutate({ id: post.id, ...postData }, {
        onSuccess: () => {
          toast.success(
            post.status === "scheduled" && finalStatus === "published" 
              ? "Post published immediately" 
              : finalStatus === "scheduled" 
              ? "Post scheduled successfully" 
              : "Post updated successfully"
          );
          onClose();
        },
      });
    } else {
      createMutation.mutate(postData, {
        onSuccess: () => {
          toast.success(
            finalStatus === "scheduled" 
              ? "Post scheduled successfully" 
              : "Post created successfully"
          );
          onClose();
        },
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
          <Button 
            variant="outline" 
            type="button"
            onClick={() => {
              setPublishMode("draft");
              handleSubmit(onSubmit)();
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>

          {publishMode === "immediate" && (
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              <Eye className="mr-2 h-4 w-4" />
              {post && post.status === "published" ? "Update Post" : "Publish Now"}
            </Button>
          )}

          {publishMode === "scheduled" && (
            <Button type="button" variant="secondary" onClick={handleSubmit(onSubmit)}>
              <Clock className="mr-2 h-4 w-4" />
              {post && post.status === "scheduled" ? "Update Schedule" : "Schedule Post"}
            </Button>
          )}

          {publishMode === "draft" && (
            <Button type="button" variant="outline" onClick={handleSubmit(onSubmit)}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
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
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>When should this post be published?</Label>
              <RadioGroup value={publishMode} onValueChange={(value: any) => setPublishMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="font-normal cursor-pointer">
                    Save as Draft
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="font-normal cursor-pointer">
                    Publish Immediately
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduled" id="scheduled" />
                  <Label htmlFor="scheduled" className="font-normal cursor-pointer">
                    Schedule for Later
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {publishMode === "scheduled" && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <Label>Publish Date & Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !scheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-[140px]"
                  />
                </div>

                {scheduleDate && scheduleTime && (
                  <p className="text-sm text-muted-foreground">
                    Will be published on {format(combineDateTime(scheduleDate, scheduleTime), "PPpp")}
                  </p>
                )}
              </div>
            )}

            {post && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {post.status}
                    </p>
                  </div>
                  <Badge
                    variant={
                      post.status === "published"
                        ? "default"
                        : post.status === "scheduled"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>

                {post.published_at && (
                  <p className="text-xs text-muted-foreground">
                    {post.status === "scheduled" ? "Scheduled for" : "Published on"}:{" "}
                    {format(new Date(post.published_at), "PPpp")}
                  </p>
                )}

                {post.auto_published && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ✓ Auto-published by system
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

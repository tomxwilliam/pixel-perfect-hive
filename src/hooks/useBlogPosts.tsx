import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string | null;
  category_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  scheduled_for?: string | null;
  auto_published?: boolean;
  view_count: number;
  read_time_minutes: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  blog_categories?: {
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  };
}

export function useBlogPosts(filters?: { status?: string; categoryId?: string; tag?: string }) {
  return useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*, blog_categories(name, slug, color)")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.tag) {
        query = query.contains("tags", [filters.tag]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, blog_categories(name, slug, color, icon)")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert([post as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create post: " + error.message);
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update post: " + error.message);
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Blog post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete post: " + error.message);
    },
  });
}

export function useIncrementViewCount() {
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("view_count")
        .eq("id", postId)
        .single();
      
      if (error) throw error;
      
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", postId);
      
      if (updateError) throw updateError;
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FeaturedContent {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  cta_text: string;
  cta_link: string;
  gradient_from: string | null;
  gradient_to: string | null;
  border_color: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useFeaturedContent = () => {
  return useQuery({
    queryKey: ["featured-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_content")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FeaturedContent[];
    },
  });
};

export const useAllFeaturedContent = () => {
  return useQuery({
    queryKey: ["all-featured-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_content")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as FeaturedContent[];
    },
  });
};

export const useCreateFeaturedContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContent: Omit<FeaturedContent, "id" | "created_at" | "updated_at" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("featured_content")
        .insert([{ ...newContent, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content"] });
      queryClient.invalidateQueries({ queryKey: ["all-featured-content"] });
      toast.success("Featured content created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create featured content: ${error.message}`);
    },
  });
};

export const useUpdateFeaturedContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeaturedContent> & { id: string }) => {
      const { data, error } = await supabase
        .from("featured_content")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content"] });
      queryClient.invalidateQueries({ queryKey: ["all-featured-content"] });
      toast.success("Featured content updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update featured content: ${error.message}`);
    },
  });
};

export const useDeleteFeaturedContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("featured_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-content"] });
      queryClient.invalidateQueries({ queryKey: ["all-featured-content"] });
      toast.success("Featured content deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete featured content: ${error.message}`);
    },
  });
};

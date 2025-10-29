import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PageContent {
  id: string;
  page_route: string;
  page_name: string;
  page_type: string;
  meta_title: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card_type?: string;
  no_index?: boolean;
  hero_section?: Record<string, any>;
  content_sections?: Record<string, any>[];
  features?: Record<string, any>[];
  testimonials?: Record<string, any>[];
  cta_section?: Record<string, any>;
  faq_items?: Record<string, any>[];
  custom_css?: string;
  custom_scripts?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  last_modified_by?: string;
}

export function usePageContent(pageRoute: string) {
  return useQuery({
    queryKey: ['page-content', pageRoute],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_route', pageRoute)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as PageContent;
    },
    enabled: !!pageRoute,
  });
}

export function useAllPageContent() {
  return useQuery({
    queryKey: ['page-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_type', { ascending: true })
        .order('page_name', { ascending: true });
      
      if (error) throw error;
      return data as PageContent[];
    },
  });
}

export function useCreatePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageContent: Omit<PageContent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('page_content')
        .insert({
          ...pageContent,
          created_by: user?.id,
          last_modified_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
      toast.success('Page content created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create page content: ' + error.message);
    },
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PageContent> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('page_content')
        .update({
          ...updates,
          last_modified_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
      queryClient.invalidateQueries({ queryKey: ['page-content', data.page_route] });
      toast.success('Page content updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update page content: ' + error.message);
    },
  });
}

export function useDeletePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
      toast.success('Page content deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete page content: ' + error.message);
    },
  });
}

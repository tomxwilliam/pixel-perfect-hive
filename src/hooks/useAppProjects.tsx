import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppProject {
  id: string;
  name: string;
  description: string;
  client_name?: string;
  logo_url?: string;
  feature_image_url?: string;
  ios_link?: string;
  android_link?: string;
  web_demo_url?: string;
  features: string[];
  technologies: string[];
  app_category: string;
  status: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useAppProjects = () => {
  return useQuery({
    queryKey: ["app-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_projects")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as AppProject[];
    },
  });
};

export const useCreateAppProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Omit<AppProject, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("app_projects")
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      toast.success("App project created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create app project: ${error.message}`);
    },
  });
};

export const useUpdateAppProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...project }: Partial<AppProject> & { id: string }) => {
      const { data, error } = await supabase
        .from("app_projects")
        .update(project)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      toast.success("App project updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update app project: ${error.message}`);
    },
  });
};

export const useDeleteAppProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get the project to find associated images
      const { data: project } = await supabase
        .from("app_projects")
        .select("logo_url, feature_image_url")
        .eq("id", id)
        .single();

      // Delete images from storage if they exist
      if (project) {
        const filesToDelete: string[] = [];
        
        if (project.logo_url) {
          const logoPath = project.logo_url.split("/").pop();
          if (logoPath) filesToDelete.push(logoPath);
        }
        
        if (project.feature_image_url) {
          const featurePath = project.feature_image_url.split("/").pop();
          if (featurePath) filesToDelete.push(featurePath);
        }

        if (filesToDelete.length > 0) {
          await supabase.storage.from("uploads").remove(filesToDelete);
        }
      }

      // Delete the project
      const { error } = await supabase
        .from("app_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-projects"] });
      toast.success("App project deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete app project: ${error.message}`);
    },
  });
};

export const useUploadAppProjectImage = () => {
  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path: string }) => {
      // Delete existing file if it exists
      const existingFileName = path.split("/").pop();
      if (existingFileName) {
        await supabase.storage.from("uploads").remove([existingFileName]);
      }

      // Upload new file
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });
};

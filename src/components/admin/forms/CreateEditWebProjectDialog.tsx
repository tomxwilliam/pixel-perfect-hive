import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Upload, Plus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { WebProject, useCreateWebProject, useUpdateWebProject, useUploadWebProjectImage } from "@/hooks/useWebProjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  project_url: z.string().url().optional().or(z.literal("")),
  screenshots: z.array(z.string()).max(5, "Maximum 5 screenshots allowed"),
});

interface CreateEditWebProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: WebProject | null;
}

export function CreateEditWebProjectDialog({
  open,
  onOpenChange,
  project,
}: CreateEditWebProjectDialogProps) {
  const createProject = useCreateWebProject();
  const updateProject = useUpdateWebProject();
  const uploadImage = useUploadWebProjectImage();

  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);
  const [features, setFeatures] = useState<Array<{ text: string; icon: string }>>([]);
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentIcon, setCurrentIcon] = useState("Star");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      project_url: "",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        project_url: project.project_url || "",
        screenshots: project.screenshots || [],
      });
      setExistingScreenshots(project.screenshots || []);
      // Parse features from "text|icon" format
      const projectFeatures = project.features || [];
      setFeatures(projectFeatures.map((f: string) => {
        if (f.includes('|')) {
          const [text, icon] = f.split('|');
          return { text, icon };
        }
        // Legacy format without icon
        return { text: f, icon: 'Star' };
      }));
    } else {
      form.reset();
      setExistingScreenshots([]);
      setFeatures([]);
    }
    setScreenshotFiles([]);
  }, [project, form]);

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFeatures([...features, { text: currentFeature.trim(), icon: currentIcon }]);
      setCurrentFeature("");
      setCurrentIcon("Star");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const iconOptions = ['Star', 'Zap', 'TrendingUp', 'Sparkles', 'Trophy', 'Rocket', 'Target', 'Heart', 'Award', 'Globe', 'Code', 'Palette', 'Users', 'Smartphone', 'Eye', 'HeadphonesIcon'];

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalScreenshots = existingScreenshots.length + screenshotFiles.length + files.length;
    
    if (totalScreenshots > 5) {
      form.setError("name", { message: "Maximum 5 screenshots allowed" });
      return;
    }

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        form.setError("name", { message: "Each screenshot must be less than 50MB" });
        return;
      }
    }

    setScreenshotFiles([...screenshotFiles, ...files]);
  };

  const removeExistingScreenshot = (index: number) => {
    setExistingScreenshots(existingScreenshots.filter((_, i) => i !== index));
  };

  const removeNewScreenshot = (index: number) => {
    setScreenshotFiles(screenshotFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Upload new screenshots in parallel for faster performance
      const uploadPromises = screenshotFiles.map((file) =>
        uploadImage.mutateAsync({
          file,
          path: "",
        })
      );
      const newScreenshotUrls = await Promise.all(uploadPromises);

      // Combine existing and new screenshots
      const allScreenshots = [...existingScreenshots, ...newScreenshotUrls];

      // Encode features as "text|icon" strings
      const encodedFeatures = features.map(f => `${f.text}|${f.icon}`);

      const projectData = {
        name: values.name,
        description: values.description,
        client_name: project?.client_name || "",
        project_url: values.project_url,
        project_type: project?.project_type || "landing",
        status: project?.status || "completed",
        is_featured: project?.is_featured || false,
        is_charity: project?.is_charity || false,
        logo_url: project?.logo_url || "",
        feature_image_url: project?.feature_image_url || "",
        screenshots: allScreenshots,
        features: encodedFeatures,
        technologies: project?.technologies || [],
        display_order: project?.display_order || 0,
      };

      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          ...projectData,
        });
      } else {
        await createProject.mutateAsync(projectData);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit" : "Create"} Web Project</DialogTitle>
          <DialogDescription>
            {project ? "Update the project details" : "Add a new web project to your portfolio"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter project name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter project description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              <div className="grid grid-cols-[1fr_150px_auto] gap-2">
                <Input
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Select value={currentIcon} onValueChange={setCurrentIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => {
                      const Icon = (LucideIcons as any)[icon];
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {icon}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addFeature} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature, index) => {
                  const Icon = (LucideIcons as any)[feature.icon];
                  return (
                    <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2">
                      {Icon && <Icon className="h-3 w-3" />}
                      <span className="text-sm">{feature.text}</span>
                      <button type="button" onClick={() => removeFeature(index)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>


            <div className="space-y-4">
              <div>
                <FormLabel>Screenshots Gallery (Max 5)</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">
                  {existingScreenshots.length + screenshotFiles.length} / 5 screenshots
                </p>

                {/* Existing Screenshots */}
                {existingScreenshots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Screenshots</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {existingScreenshots.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingScreenshot(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Screenshot Previews */}
                {screenshotFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">New Screenshots</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {screenshotFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewScreenshot(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {existingScreenshots.length + screenshotFiles.length < 5 && (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Add screenshots (max 50MB each)
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotsChange}
                      className="hidden"
                      id="screenshots-upload"
                    />
                    <label htmlFor="screenshots-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose Files</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>


            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createProject.isPending || updateProject.isPending || uploadImage.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProject.isPending || updateProject.isPending || uploadImage.isPending}
              >
                {uploadImage.isPending 
                  ? "Uploading images..." 
                  : createProject.isPending || updateProject.isPending
                  ? "Saving..."
                  : project ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

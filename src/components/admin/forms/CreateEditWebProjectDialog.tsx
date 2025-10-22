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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Upload, Plus } from "lucide-react";
import { WebProject, useCreateWebProject, useUpdateWebProject, useUploadWebProjectImage } from "@/hooks/useWebProjects";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  client_name: z.string().optional(),
  project_url: z.string().url().optional().or(z.literal("")),
  project_type: z.string().min(1, "Project type is required"),
  status: z.string().min(1, "Status is required"),
  is_featured: z.boolean(),
  is_charity: z.boolean(),
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string>("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentTechnology, setCurrentTechnology] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client_name: "",
      project_url: "",
      project_type: "landing",
      status: "completed",
      is_featured: false,
      is_charity: false,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        client_name: project.client_name || "",
        project_url: project.project_url || "",
        project_type: project.project_type,
        status: project.status,
        is_featured: project.is_featured,
        is_charity: project.is_charity,
        screenshots: project.screenshots || [],
      });
      setLogoPreview(project.logo_url || "");
      setFeaturePreview(project.feature_image_url || "");
      setExistingScreenshots(project.screenshots || []);
      setFeatures(project.features || []);
      setTechnologies(project.technologies || []);
    } else {
      form.reset();
      setLogoPreview("");
      setFeaturePreview("");
      setExistingScreenshots([]);
      setFeatures([]);
      setTechnologies([]);
    }
    setLogoFile(null);
    setFeatureFile(null);
    setScreenshotFiles([]);
  }, [project, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        form.setError("name", { message: "Logo must be less than 50MB" });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        form.setError("name", { message: "Feature image must be less than 50MB" });
        return;
      }
      setFeatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFeatures([...features, currentFeature.trim()]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addTechnology = () => {
    if (currentTechnology.trim()) {
      setTechnologies([...technologies, currentTechnology.trim()]);
      setCurrentTechnology("");
    }
  };

  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };

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
      let logoUrl = project?.logo_url || "";
      let featureUrl = project?.feature_image_url || "";

      if (logoFile) {
        logoUrl = await uploadImage.mutateAsync({
          file: logoFile,
          path: logoUrl,
        });
      }

      if (featureFile) {
        featureUrl = await uploadImage.mutateAsync({
          file: featureFile,
          path: featureUrl,
        });
      }

      // Upload new screenshots
      const newScreenshotUrls: string[] = [];
      for (const file of screenshotFiles) {
        const url = await uploadImage.mutateAsync({
          file,
          path: "",
        });
        newScreenshotUrls.push(url);
      }

      // Combine existing and new screenshots
      const allScreenshots = [...existingScreenshots, ...newScreenshotUrls];

      const projectData = {
        name: values.name,
        description: values.description,
        client_name: values.client_name,
        project_url: values.project_url,
        project_type: values.project_type,
        status: values.status,
        is_featured: values.is_featured,
        is_charity: values.is_charity,
        logo_url: logoUrl,
        feature_image_url: featureUrl,
        screenshots: allScreenshots,
        features,
        technologies,
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
            <div className="grid md:grid-cols-2 gap-4">
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
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter client name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  <FormLabel>Project URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="landing">Landing Page</SelectItem>
                        <SelectItem value="business">Business Website</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="portfolio">Portfolio</SelectItem>
                        <SelectItem value="webapp">Web App</SelectItem>
                        <SelectItem value="pwa">PWA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="launched">Launched</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Logo (Optional)</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-cover mx-auto rounded" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload logo (max 50MB)</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Feature Image (Optional)</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                  {featurePreview ? (
                    <img src={featurePreview} alt="Feature preview" className="w-32 h-32 object-cover mx-auto rounded" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload screenshot (max 50MB)</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFeatureChange}
                    className="hidden"
                    id="feature-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => document.getElementById('feature-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={currentFeature}
                  onChange={(e) => setCurrentFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((feature, index) => (
                  <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-sm">{feature}</span>
                    <button type="button" onClick={() => removeFeature(index)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Technologies</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={currentTechnology}
                  onChange={(e) => setCurrentTechnology(e.target.value)}
                  placeholder="Add a technology"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {technologies.map((tech, index) => (
                  <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-sm">{tech}</span>
                    <button type="button" onClick={() => removeTechnology(index)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
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

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Featured Project</FormLabel>
                      <p className="text-sm text-muted-foreground">Highlight this project</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_charity"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Charity Project</FormLabel>
                      <p className="text-sm text-muted-foreground">Mark as charity work</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending || updateProject.isPending}>
                {createProject.isPending || updateProject.isPending ? "Saving..." : project ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

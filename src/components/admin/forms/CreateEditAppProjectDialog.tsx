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
import { AppProject, useCreateAppProject, useUpdateAppProject, useUploadAppProjectImage } from "@/hooks/useAppProjects";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  client_name: z.string().optional(),
  ios_link: z.string().url().optional().or(z.literal("")),
  android_link: z.string().url().optional().or(z.literal("")),
  web_demo_url: z.string().url().optional().or(z.literal("")),
  app_category: z.string().min(1, "App category is required"),
  status: z.string().min(1, "Status is required"),
  is_featured: z.boolean(),
});

interface CreateEditAppProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: AppProject | null;
}

export function CreateEditAppProjectDialog({
  open,
  onOpenChange,
  project,
}: CreateEditAppProjectDialogProps) {
  const createProject = useCreateAppProject();
  const updateProject = useUpdateAppProject();
  const uploadImage = useUploadAppProjectImage();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [featureFile, setFeatureFile] = useState<File | null>(null);
  const [featurePreview, setFeaturePreview] = useState<string>("");
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
      ios_link: "",
      android_link: "",
      web_demo_url: "",
      app_category: "productivity",
      status: "completed",
      is_featured: false,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        client_name: project.client_name || "",
        ios_link: project.ios_link || "",
        android_link: project.android_link || "",
        web_demo_url: project.web_demo_url || "",
        app_category: project.app_category,
        status: project.status,
        is_featured: project.is_featured,
      });
      setLogoPreview(project.logo_url || "");
      setFeaturePreview(project.feature_image_url || "");
      setFeatures(project.features || []);
      setTechnologies(project.technologies || []);
    } else {
      form.reset();
      setLogoPreview("");
      setFeaturePreview("");
      setFeatures([]);
      setTechnologies([]);
    }
    setLogoFile(null);
    setFeatureFile(null);
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

      const projectData = {
        name: values.name,
        description: values.description,
        client_name: values.client_name,
        ios_link: values.ios_link,
        android_link: values.android_link,
        web_demo_url: values.web_demo_url,
        app_category: values.app_category,
        status: values.status,
        is_featured: values.is_featured,
        logo_url: logoUrl,
        feature_image_url: featureUrl,
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
          <DialogTitle>{project ? "Edit" : "Create"} App Project</DialogTitle>
          <DialogDescription>
            {project ? "Update the project details" : "Add a new app project to your portfolio"}
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
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter app name" />
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
                    <Textarea {...field} placeholder="Enter app description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ios_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>iOS App Store Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://apps.apple.com/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="android_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Play Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://play.google.com/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="web_demo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Web Demo URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://demo.example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="app_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select app category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="health">Health & Fitness</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
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
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </label>
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
                  <label htmlFor="feature-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </label>
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

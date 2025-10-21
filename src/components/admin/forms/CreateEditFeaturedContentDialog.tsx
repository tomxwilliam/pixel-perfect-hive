import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateFeaturedContent, useUpdateFeaturedContent, FeaturedContent } from "@/hooks/useFeaturedContent";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const featuredContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  cta_text: z.string().min(1, "CTA text is required"),
  cta_link: z.string().url("Must be a valid URL"),
  gradient_from: z.string().optional(),
  gradient_to: z.string().optional(),
  border_color: z.string().optional(),
  is_active: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  display_order: z.number().min(0),
});

type FeaturedContentForm = z.infer<typeof featuredContentSchema>;

const colorOptions = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "accent", label: "Accent" },
  { value: "yellow-500", label: "Yellow" },
  { value: "orange-500", label: "Orange" },
  { value: "red-500", label: "Red" },
  { value: "blue-500", label: "Blue" },
  { value: "green-500", label: "Green" },
  { value: "purple-500", label: "Purple" },
  { value: "pink-500", label: "Pink" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: FeaturedContent;
}

export default function CreateEditFeaturedContentDialog({ open, onOpenChange, content }: Props) {
  const createMutation = useCreateFeaturedContent();
  const updateMutation = useUpdateFeaturedContent();
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FeaturedContentForm>({
    resolver: zodResolver(featuredContentSchema),
    defaultValues: {
      is_active: false,
      display_order: 0,
      title: "",
      cta_text: "",
      cta_link: "",
    },
  });

  // Reset form when content changes (for edit mode)
  useEffect(() => {
    if (content) {
      reset({
        title: content.title,
        subtitle: content.subtitle || "",
        description: content.description || "",
        icon: content.icon || "",
        cta_text: content.cta_text,
        cta_link: content.cta_link,
        gradient_from: content.gradient_from || "",
        gradient_to: content.gradient_to || "",
        border_color: content.border_color || "",
        is_active: content.is_active,
        start_date: content.start_date || "",
        end_date: content.end_date || "",
        display_order: content.display_order,
      });
    } else {
      reset({
        is_active: false,
        display_order: 0,
        title: "",
        cta_text: "",
        cta_link: "",
        subtitle: "",
        description: "",
        icon: "",
        gradient_from: "",
        gradient_to: "",
        border_color: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [content, reset]);

  const formValues = watch();

  const onSubmit = async (data: FeaturedContentForm) => {
    try {
      // Convert empty strings to null for optional fields
      const payload = {
        ...data,
        subtitle: data.subtitle || null,
        description: data.description || null,
        icon: data.icon || null,
        gradient_from: data.gradient_from || null,
        gradient_to: data.gradient_to || null,
        border_color: data.border_color || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      if (content) {
        await updateMutation.mutateAsync({ id: content.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving featured content:", error);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content ? "Edit Featured Content" : "Create Featured Content"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} placeholder="Now Featuring: BeeVerse" />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input id="subtitle" {...register("subtitle")} placeholder="The ultimate idle bee empire game" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Download now on iPhone" rows={2} />
              </div>

              <div>
                <Label htmlFor="icon">Icon (emoji or Lucide icon name)</Label>
                <Input id="icon" {...register("icon")} placeholder="🐝" />
              </div>

              <div>
                <Label htmlFor="cta_text">CTA Button Text *</Label>
                <Input id="cta_text" {...register("cta_text")} placeholder="App Store" />
                {errors.cta_text && <p className="text-sm text-destructive mt-1">{errors.cta_text.message}</p>}
              </div>

              <div>
                <Label htmlFor="cta_link">CTA Link (URL) *</Label>
                <Input id="cta_link" {...register("cta_link")} placeholder="https://example.com" />
                {errors.cta_link && <p className="text-sm text-destructive mt-1">{errors.cta_link.message}</p>}
              </div>

              <div>
                <Label htmlFor="gradient_from">Gradient From Color</Label>
                <Select value={formValues.gradient_from} onValueChange={(value) => setValue("gradient_from", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gradient_to">Gradient To Color</Label>
                <Select value={formValues.gradient_to} onValueChange={(value) => setValue("gradient_to", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="border_color">Border Color</Label>
                <Select value={formValues.border_color} onValueChange={(value) => setValue("border_color", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date">Start Date (optional)</Label>
                <Input id="start_date" type="datetime-local" {...register("start_date")} />
              </div>

              <div>
                <Label htmlFor="end_date">End Date (optional)</Label>
                <Input id="end_date" type="datetime-local" {...register("end_date")} />
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input id="display_order" type="number" {...register("display_order", { valueAsNumber: true })} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formValues.is_active} onCheckedChange={(checked) => setValue("is_active", checked)} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Live Preview</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>

              {showPreview && (
                <Card className={`overflow-hidden border ${formValues.border_color ? `border-${formValues.border_color}/20` : "border-primary/20"}`}>
                  <CardContent className={`p-3 bg-gradient-to-br ${formValues.gradient_from ? `from-${formValues.gradient_from}/5` : "from-primary/5"} ${formValues.gradient_to ? `to-${formValues.gradient_to}/5` : "to-accent/5"}`}>
                    <div className="flex items-start gap-2">
                      {formValues.icon && (
                        <div className="text-xl">{formValues.icon}</div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold mb-0.5">{formValues.title || "Title"}</h3>
                        {formValues.subtitle && (
                          <p className="text-xs text-muted-foreground mb-0.5">{formValues.subtitle}</p>
                        )}
                        {formValues.description && (
                          <p className="text-xs text-muted-foreground/70 mb-2">{formValues.description}</p>
                        )}
                        <Button variant="default" size="sm" className="tap-target h-8 text-xs px-3">
                          {formValues.cta_text || "CTA Text"} <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : content ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

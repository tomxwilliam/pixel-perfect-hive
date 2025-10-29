import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBlogCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useBlogCategories";
import { slugify } from "@/utils/slugify";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const { data: categories } = useBlogCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const name = watch("name");

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setSelectedCategory(category);
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        icon: category.icon || "",
        color: category.color || "",
      });
    } else {
      setSelectedCategory(null);
      reset({
        name: "",
        slug: "",
        description: "",
        icon: "",
        color: "#3b82f6",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, ...data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge style={{ backgroundColor: category.color || undefined }}>
                        {category.post_count} posts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Slug: {category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteId(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                onChange={(e) => {
                  register("name").onChange(e);
                  if (!selectedCategory) {
                    setValue("slug", slugify(e.target.value));
                  }
                }}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" {...register("slug")} />
              {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={3} />
            </div>

            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" {...register("icon")} placeholder="💻" maxLength={2} />
            </div>

            <div>
              <Label htmlFor="color">Badge Color</Label>
              <Input id="color" type="color" {...register("color")} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedCategory ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Category"
        description="Are you sure you want to delete this category? Posts in this category will not be deleted."
      />
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAllFeaturedContent, useDeleteFeaturedContent, useUpdateFeaturedContent, FeaturedContent } from "@/hooks/useFeaturedContent";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import CreateEditFeaturedContentDialog from "./forms/CreateEditFeaturedContentDialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

export default function AdminFeaturedContent() {
  const { data: featuredContent, isLoading } = useAllFeaturedContent();
  const deleteMutation = useDeleteFeaturedContent();
  const updateMutation = useUpdateFeaturedContent();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<FeaturedContent | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<FeaturedContent | null>(null);

  const handleCreateNew = () => {
    setSelectedContent(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (content: FeaturedContent) => {
    setSelectedContent(content);
    setDialogOpen(true);
  };

  const handleDelete = (content: FeaturedContent) => {
    setContentToDelete(content);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (contentToDelete) {
      await deleteMutation.mutateAsync(contentToDelete.id);
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const handleToggleActive = async (content: FeaturedContent) => {
    await updateMutation.mutateAsync({
      id: content.id,
      is_active: !content.is_active,
    });
  };

  const getStatusBadge = (content: FeaturedContent) => {
    const now = new Date();
    const startDate = content.start_date ? new Date(content.start_date) : null;
    const endDate = content.end_date ? new Date(content.end_date) : null;

    if (!content.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (startDate && startDate > now) {
      return <Badge className="bg-blue-500">Scheduled</Badge>;
    }

    if (endDate && endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge className="bg-green-500">Active</Badge>;
  };

  const filteredContent = featuredContent?.filter((content) =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading featured content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Featured Content Management</h2>
          <p className="text-sm text-muted-foreground">Manage homepage featured content boxes</p>
        </div>
        <Button onClick={handleCreateNew} className="btn-glow tap-target">
          <Plus className="h-4 w-4 mr-2" />
          Add Featured Content
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search featured content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-4">
        {filteredContent?.map((content) => (
          <Card key={content.id} className="card-premium">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {content.icon && <span className="text-2xl">{content.icon}</span>}
                  <div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    {content.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1">{content.subtitle}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(content)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(content.start_date || content.end_date) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {content.start_date && (
                    <div>Start: {format(new Date(content.start_date), "PPp")}</div>
                  )}
                  {content.end_date && (
                    <div>End: {format(new Date(content.end_date), "PPp")}</div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={content.is_active}
                  onCheckedChange={() => handleToggleActive(content)}
                />
                <span className="text-sm">Active</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(content)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(content)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="card-premium">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Content</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Date Range</th>
                  <th className="text-left p-4 font-semibold">Active</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent?.map((content) => (
                  <tr key={content.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {content.icon && <span className="text-2xl">{content.icon}</span>}
                        <div>
                          <div className="font-medium">{content.title}</div>
                          {content.subtitle && (
                            <div className="text-sm text-muted-foreground">{content.subtitle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(content)}</td>
                    <td className="p-4">
                      <div className="text-sm space-y-1">
                        {content.start_date && (
                          <div>Start: {format(new Date(content.start_date), "PP")}</div>
                        )}
                        {content.end_date && (
                          <div>End: {format(new Date(content.end_date), "PP")}</div>
                        )}
                        {!content.start_date && !content.end_date && (
                          <div className="text-muted-foreground">No date range</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={content.is_active}
                        onCheckedChange={() => handleToggleActive(content)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(content)}
                          className="tap-target"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(content)}
                          className="text-destructive hover:text-destructive tap-target"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {filteredContent?.length === 0 && (
        <Card className="card-premium">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No featured content found</p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateEditFeaturedContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        content={selectedContent}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Featured Content"
        description={`Are you sure you want to delete "${contentToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

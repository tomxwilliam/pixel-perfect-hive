import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useWebProjects, useUpdateWebProject, useDeleteWebProject, WebProject } from "@/hooks/useWebProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, GripVertical, Globe, Star } from "lucide-react";
import { CreateEditWebProjectDialog } from "./forms/CreateEditWebProjectDialog";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export function AdminWebProjects() {
  const { data: projects, isLoading } = useWebProjects();
  const updateProject = useUpdateWebProject();
  const deleteProject = useDeleteWebProject();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<WebProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<WebProject | null>(null);

  const handleCreateNew = () => {
    setSelectedProject(null);
    setDialogOpen(true);
  };

  const handleEdit = (project: WebProject) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleDelete = (project: WebProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject.mutate(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !projects) return;

    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all affected items
    for (let i = 0; i < items.length; i++) {
      if (items[i].display_order !== i) {
        await updateProject.mutateAsync({
          id: items[i].id,
          display_order: i,
        });
      }
    }
  };

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      launched: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Web Projects</h1>
          <p className="text-muted-foreground">Manage your web development portfolio</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredProjects?.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {project.logo_url && (
                    <img src={project.logo_url} alt={project.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    {project.client_name && (
                      <p className="text-sm text-muted-foreground truncate">{project.client_name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(project.status)}
                <Badge variant="outline">{project.project_type}</Badge>
                {project.is_featured && <Badge variant="secondary"><Star className="h-3 w-3" /></Badge>}
                {project.is_charity && <Badge variant="outline">Charity</Badge>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(project)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(project)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {filteredProjects?.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                            
                            {project.logo_url && (
                              <img src={project.logo_url} alt={project.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{project.name}</h3>
                                {project.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                              {project.client_name && (
                                <p className="text-xs text-muted-foreground">Client: {project.client_name}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(project.status)}
                              <Badge variant="outline">{project.project_type}</Badge>
                              {project.is_charity && <Badge variant="outline">Charity</Badge>}
                            </div>

                            {project.project_url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-4 w-4" />
                                </a>
                              </Button>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(project)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <CreateEditWebProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Web Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"?`}
        warningText="This will also delete all associated images from storage."
        loading={deleteProject.isPending}
      />
    </div>
  );
}

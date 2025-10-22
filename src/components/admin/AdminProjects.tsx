
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Calendar, PoundSterling, Search, Paperclip, Download, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { CreateProjectDialog } from './forms/CreateProjectDialog';
import { EnhancedCreateProjectDialog } from './forms/EnhancedCreateProjectDialog';
import { ProjectEditModal } from './modals/ProjectEditModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectApprovalDashboard } from './ProjectApprovalDashboard';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

type Project = Tables<'projects'>;
type Profile = Tables<'profiles'>;
type FileUpload = Tables<'file_uploads'>;

interface ProjectWithCustomer extends Project {
  customer: Profile;
  file_count?: number;
}

interface ProjectDetailsProps {
  project: ProjectWithCustomer;
  files: FileUpload[];
}

const ProjectDetailsModal: React.FC<ProjectDetailsProps> = ({ project, files }) => {
  const { getFileUrl } = useFileUpload();

  const handleDownload = async (file: FileUpload) => {
    const url = await getFileUrl(file.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatRequirements = (requirements: any) => {
    if (!requirements || typeof requirements !== 'object') return null;

    return Object.entries(requirements).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
        <span className="text-muted-foreground">
          {Array.isArray(value) ? value.join(', ') : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{project.title}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Customer Information</h4>
            <p className="text-sm">
              <span className="font-medium">Name:</span> {project.customer?.first_name} {project.customer?.last_name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {project.customer?.email}
            </p>
            {project.customer?.company_name && (
              <p className="text-sm">
                <span className="font-medium">Company:</span> {project.customer.company_name}
              </p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Project Details</h4>
            <p className="text-sm">
              <span className="font-medium">Type:</span> {project.project_type}
            </p>
            <p className="text-sm">
              <span className="font-medium">Status:</span> 
              <Badge className="ml-2">{project.status.replace('_', ' ')}</Badge>
            </p>
            {project.budget && (
              <p className="text-sm">
                <span className="font-medium">Budget:</span> £{Number(project.budget).toLocaleString()}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        )}

        {/* Requirements */}
        {project.requirements && (
          <div>
            <h4 className="font-medium mb-2">Requirements</h4>
            <div className="text-sm">
              {formatRequirements(project.requirements)}
            </div>
          </div>
        )}

        {/* Files */}
        {files && files.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Attached Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.original_filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file_size / 1024).toFixed(1)} KB • Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export const AdminProjects = () => {
  const [projects, setProjects] = useState<ProjectWithCustomer[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<string, FileUpload[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<ProjectWithCustomer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithCustomer | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select(`
          *,
          customer:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        setProjects(data as ProjectWithCustomer[]);
        
        // Fetch file counts for each project
        const projectIds = data.map(p => p.id);
        if (projectIds.length > 0) {
          const { data: filesData } = await supabase
            .from('file_uploads')
            .select('*')
            .eq('entity_type', 'project')
            .in('entity_id', projectIds);

          if (filesData) {
            const filesByProject = filesData.reduce((acc, file) => {
              if (!acc[file.entity_id!]) {
                acc[file.entity_id!] = [];
              }
              acc[file.entity_id!].push(file);
              return acc;
            }, {} as Record<string, FileUpload[]>);
            
            setProjectFiles(filesByProject);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleDeleteProject = (project: ProjectWithCustomer) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Check for related records first
      const [quotesResult, invoicesResult, ticketsResult] = await Promise.all([
        supabase.from('quotes').select('id').eq('project_id', projectToDelete.id).limit(1),
        supabase.from('invoices').select('id').eq('project_id', projectToDelete.id).limit(1),
        supabase.from('tickets').select('id').eq('project_id', projectToDelete.id).limit(1)
      ]);

      const hasRelatedRecords = [quotesResult, invoicesResult, ticketsResult]
        .some(result => result.data && result.data.length > 0);

      if (hasRelatedRecords) {
        toast({
          title: "Error",
          description: "Cannot delete project: has related quotes, invoices, or tickets that must be removed first",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        return;
      }

      // Delete related files first
      const { error: filesError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('entity_type', 'project')
        .eq('entity_id', projectToDelete.id);

      if (filesError) {
        console.error('Error deleting files:', filesError);
        // Continue with project deletion even if file deletion fails
      }

      // Delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) {
        console.error('Delete error:', error);
        if (error.code === '23503') {
          toast({
            title: "Error",
            description: "Cannot delete project: has related records that must be removed first",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete project: ${error.message}`,
            variant: "destructive",
          });
        }
        setDeleteDialogOpen(false);
        setProjectToDelete(null);
        return;
      }
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      await fetchProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮';
      case 'app': return '📱';
      case 'web': return '💻';
      default: return '📄';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || project.approval_status === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
          <CardDescription>Loading projects...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectApprovalDashboard />
      
      <Card>
      <CardHeader>
        <CardTitle>Project Management</CardTitle>
        <CardDescription>
          Track and manage all customer projects
        </CardDescription>
        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center justify-between'}`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'}`}>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isMobile ? "w-full" : "max-w-sm"}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
                <SelectValue placeholder="Workflow Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Workflow Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Approval Status</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            <EnhancedCreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getTypeIcon(project.project_type)}</span>
                      <h4 className="font-medium">{project.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        variant={
                          project.approval_status === 'approved' ? 'default' :
                          project.approval_status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {project.approval_status || 'pending'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.customer?.first_name && project.customer?.last_name
                          ? `${project.customer.first_name} ${project.customer.last_name}`
                          : project.customer?.email || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <ProjectDetailsModal 
                        project={project} 
                        files={projectFiles[project.id] || []} 
                      />
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setIsEditModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <PoundSterling className="h-3 w-3" />
                    <span>{project.budget ? `£${Number(project.budget).toLocaleString()}` : 'TBD'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3" />
                    <span>{projectFiles[project.id]?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {project.estimated_completion_date 
                        ? new Date(project.estimated_completion_date).toLocaleDateString()
                        : 'TBD'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Workflow Status</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.description?.slice(0, 50)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {project.customer?.first_name} {project.customer?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {project.customer?.company_name || project.customer?.email || 'Unassigned'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{getTypeIcon(project.project_type)}</span>
                      <span className="capitalize">{project.project_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        project.approval_status === 'approved' ? 'default' :
                        project.approval_status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {project.approval_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <PoundSterling className="h-3 w-3" />
                      <span>{project.budget ? `${Number(project.budget).toLocaleString()}` : 'TBD'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-sm">
                        {projectFiles[project.id]?.length || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">
                        {project.estimated_completion_date 
                          ? new Date(project.estimated_completion_date).toLocaleDateString()
                          : 'TBD'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <ProjectDetailsModal 
                          project={project} 
                          files={projectFiles[project.id] || []} 
                        />
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setIsEditModalOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {selectedProject && (
        <ProjectEditModal
          project={selectedProject}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onProjectUpdated={fetchProjects}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete the project "${projectToDelete?.title}"?`}
        warningText="This will also delete all associated files and tickets. This action cannot be undone."
      />
      </Card>
    </div>
  );
};

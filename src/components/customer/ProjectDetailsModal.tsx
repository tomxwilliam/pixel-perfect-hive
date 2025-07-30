import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { Calendar, DollarSign, FileText, Clock, Target, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FileUpload, FileList } from '@/components/ui/file-upload';
import { useState, useEffect } from 'react';

type Project = Tables<'projects'>;

interface ProjectDetailsModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  open,
  onOpenChange,
}) => {
  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'completed': return 100;
      case 'in_progress': return 60;
      case 'pending': return 10;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const FileSection = ({ projectId }: { projectId: string }) => {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchFiles();
    }, [projectId]);

    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('file_uploads')
          .select('*')
          .eq('entity_id', projectId)
          .eq('entity_type', 'project');

        if (error) throw error;
        setFiles(data || []);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleFileUploaded = () => {
      fetchFiles();
    };

    const handleFileRemoved = () => {
      fetchFiles();
    };

    if (loading) {
      return <div className="text-sm text-muted-foreground">Loading files...</div>;
    }

    return (
      <div className="space-y-4">
        <FileUpload
          onFileUploaded={handleFileUploaded}
          entityType="project"
          entityId={projectId}
          maxFileSize={10 * 1024 * 1024}
          className="border-dashed border-2 border-muted"
        />
        <FileList
          files={files}
          onRemove={handleFileRemoved}
          showRemove={false}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Project ID: #{project.id.split('-')[0]}
                    </span>
                  </div>
                </div>
                {project.budget && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      £{Number(project.budget).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Project Progress</span>
                  <span>{getProgressPercentage(project.status)}%</span>
                </div>
                <Progress value={getProgressPercentage(project.status)} className="h-3" />
              </div>

              {/* Description */}
              {project.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Started</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(project.created_at)}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="font-medium">Estimated Completion</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(project.estimated_completion_date)}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Actual Completion</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(project.actual_completion_date)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {project.requirements && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Project Requirements</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(project.requirements, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Type & Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Project Type</h3>
                <Badge variant="outline" className="text-sm">
                  {project.project_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Project Files</h3>
                <FileSection projectId={project.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { CalendarIcon, Save, X, Edit, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Project = Tables<'projects'>;
type Profile = Tables<'profiles'>;

interface ProjectWithCustomer extends Project {
  customer: Profile;
}

interface ProjectEditModalProps {
  project: ProjectWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: () => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  open,
  onOpenChange,
  onProjectUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([]);
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    customer_id: project.customer_id,
    status: project.status,
    project_type: project.project_type,
    budget: project.budget ? Number(project.budget) : 0,
    estimated_completion_date: project.estimated_completion_date ? new Date(project.estimated_completion_date) : null
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: project.title,
        description: project.description || '',
        customer_id: project.customer_id,
        status: project.status,
        project_type: project.project_type,
        budget: project.budget ? Number(project.budget) : 0,
        estimated_completion_date: project.estimated_completion_date ? new Date(project.estimated_completion_date) : null
      });
      setIsEditing(false);

      // Fetch customers
      const fetchCustomers = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .order('first_name');
        
        if (!error && data) {
          setCustomers(data);
        }
      };

      fetchCustomers();
    }
  }, [open, project]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          customer_id: formData.customer_id,
          status: formData.status as any,
          project_type: formData.project_type as any,
          budget: formData.budget,
          estimated_completion_date: formData.estimated_completion_date?.toISOString().split('T')[0]
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success('Project updated successfully');
      setIsEditing(false);
      onProjectUpdated();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: project.title,
      description: project.description || '',
      customer_id: project.customer_id,
      status: project.status,
      project_type: project.project_type,
      budget: project.budget ? Number(project.budget) : 0,
      estimated_completion_date: project.estimated_completion_date ? new Date(project.estimated_completion_date) : null
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditing ? 'Edit Project' : 'Project Details'}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <p className="text-sm font-medium">
                    {project.customer?.first_name} {project.customer?.last_name}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{project.customer?.email}</p>
                </div>
                {project.customer?.company_name && (
                  <div>
                    <Label>Company</Label>
                    <p className="text-sm">{project.customer.company_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{project.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customer">Customer</Label>
                  {isEditing ? (
                    <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.first_name && customer.last_name 
                              ? `${customer.first_name} ${customer.last_name} (${customer.email})`
                              : customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm mt-1">
                      {project.customer?.first_name && project.customer?.last_name
                        ? `${project.customer.first_name} ${project.customer.last_name}`
                        : project.customer?.email || 'Unassigned'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Project Type</Label>
                  {isEditing ? (
                    <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web Development</SelectItem>
                        <SelectItem value="app">App Development</SelectItem>
                        <SelectItem value="game">Game Development</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm mt-1 capitalize">{project.project_type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(project.status)} variant="secondary">
                      {project.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label htmlFor="budget">Budget (£)</Label>
                  {isEditing ? (
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    />
                  ) : (
                    <p className="text-sm mt-1">
                      {project.budget ? `£${Number(project.budget).toLocaleString()}` : 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="completion-date">Estimated Completion Date</Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.estimated_completion_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.estimated_completion_date ? (
                            format(formData.estimated_completion_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.estimated_completion_date || undefined}
                          onSelect={(date) => setFormData({ ...formData, estimated_completion_date: date || null })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm mt-1">
                      {project.estimated_completion_date 
                        ? new Date(project.estimated_completion_date).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description || 'No description provided'}
                  </p>
                )}
              </div>

              {/* Requirements (Read-only) */}
              {project.requirements && (
                <div>
                  <Label>Requirements</Label>
                  <div className="text-sm mt-1 space-y-1">
                    {formatRequirements(project.requirements)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label>Created</Label>
                  <p>{new Date(project.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{new Date(project.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
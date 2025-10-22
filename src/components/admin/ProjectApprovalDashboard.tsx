import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;
type Profile = Tables<'profiles'>;

interface ProjectWithCustomer extends Project {
  customer: Profile;
}

export const ProjectApprovalDashboard = () => {
  const [pendingProjects, setPendingProjects] = useState<ProjectWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCustomer | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [customers, setCustomers] = useState<Array<{ id: string; first_name: string; last_name: string; email: string }>>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customer:profiles(*)
        `)
        .eq('approval_status', 'pending')
        .order('approval_requested_at', { ascending: true });

      if (error) throw error;
      setPendingProjects(data as ProjectWithCustomer[] || []);
    } catch (error) {
      console.error('Error fetching pending projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProjects();

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

    // Real-time subscription for new approval requests
    const channel = supabase
      .channel('project-approvals')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => fetchPendingProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApproval = async (projectId: string, decision: 'approved' | 'rejected' | 'revision_requested') => {
    setActionLoading(true);
    try {
      // Update approval status and optionally customer_id
      const updateData: any = {
        approval_status: decision,
        approval_notes: approvalNotes || null,
      };

      if (newCustomerId) {
        updateData.customer_id = newCustomerId;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Project ${decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'marked for revision'} successfully`,
      });

      setApprovalNotes('');
      setNewCustomerId('');
      setSelectedProject(null);
      fetchPendingProjects();
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: "Error",
        description: "Failed to process approval",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'revision_requested': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRequirements = (requirements: any) => {
    if (!requirements || typeof requirements !== 'object') return null;

    return (
      <div className="space-y-2">
        {requirements.features && requirements.features.length > 0 && (
          <div>
            <span className="font-medium">Features: </span>
            <span className="text-muted-foreground">{requirements.features.join(', ')}</span>
          </div>
        )}
        {requirements.platforms && requirements.platforms.length > 0 && (
          <div>
            <span className="font-medium">Platforms: </span>
            <span className="text-muted-foreground">{requirements.platforms.join(', ')}</span>
          </div>
        )}
        {requirements.design_preferences && (
          <div>
            <span className="font-medium">Design: </span>
            <span className="text-muted-foreground">{requirements.design_preferences}</span>
          </div>
        )}
        {requirements.additional_notes && (
          <div>
            <span className="font-medium">Notes: </span>
            <span className="text-muted-foreground">{requirements.additional_notes}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Pending Project Approvals ({pendingProjects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{project.title}</h4>
                    <p className="text-muted-foreground line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{project.status}</Badge>
                      <Badge className={getApprovalStatusColor(project.approval_status || 'pending')}>
                        {project.approval_status || 'pending'}
                      </Badge>
                      <Badge variant="outline">{project.project_type}</Badge>
                      {project.budget && (
                        <Badge variant="outline">£{Number(project.budget).toLocaleString()}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProject(project)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Project Review: {project.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Customer Info */}
                          <div>
                            <h4 className="font-medium mb-2">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Name:</span> {
                                  project.customer?.first_name && project.customer?.last_name
                                    ? `${project.customer.first_name} ${project.customer.last_name}`
                                    : project.customer?.email || <Badge variant="secondary">Unassigned</Badge>
                                }
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {project.customer?.email || 'N/A'}
                              </div>
                              {project.customer?.company_name && (
                                <div>
                                  <span className="font-medium">Company:</span> {project.customer.company_name}
                                </div>
                              )}
                              {project.customer?.phone && (
                                <div>
                                  <span className="font-medium">Phone:</span> {project.customer.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Project Details */}
                          <div>
                            <h4 className="font-medium mb-2">Project Details</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Workflow Status:</span> <Badge variant="outline">{project.status}</Badge>
                              </div>
                              <div>
                                <span className="font-medium">Approval Status:</span> <Badge variant="secondary">{project.approval_status || 'pending'}</Badge>
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {project.project_type}
                              </div>
                              <div>
                                <span className="font-medium">Budget:</span> {project.budget ? `£${Number(project.budget).toLocaleString()}` : 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Timeline:</span> {project.estimated_completion_date ? new Date(project.estimated_completion_date).toLocaleDateString() : 'Not specified'}
                              </div>
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(project.approval_requested_at || project.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>

                          {/* Requirements */}
                          {project.requirements && (
                            <div>
                              <h4 className="font-medium mb-2">Requirements</h4>
                              <div className="text-sm">
                                {formatRequirements(project.requirements)}
                              </div>
                            </div>
                          )}

                          {/* Approval Actions */}
                          <div className="space-y-4 border-t pt-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Assign/Reassign Customer (Optional)</label>
                              <Select value={newCustomerId} onValueChange={setNewCustomerId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer (optional)" />
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
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Approval Notes</label>
                              <Textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder="Add notes about your decision..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => handleApproval(project.id, 'revision_requested')}
                                disabled={actionLoading}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Request Revision
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleApproval(project.id, 'rejected')}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleApproval(project.id, 'approved')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    Customer: {project.customer?.first_name} {project.customer?.last_name}
                  </div>
                  <div>
                    Requested: {new Date(project.approval_requested_at || project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Clock, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminDomainManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [notes, setNotes] = useState("");

  // Fetch all domains with simplified query for faster loading
  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['admin-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          profiles:customer_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Limit for faster loading
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch provisioning requests (disabled if table doesn't exist)
  const { data: provisioningRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['provisioning-requests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('provisioning_requests')
          .select(`
            *,
            profiles:customer_id(first_name, last_name, email)
          `)
          .eq('request_type', 'domain_registration')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Provisioning requests table not available:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry if table doesn't exist
  });

  // Update domain status
  const updateDomainStatus = useMutation({
    mutationFn: async ({ domainId, status, notes }: { domainId: string, status: string, notes?: string }) => {
      const updates: any = { status };
      
      if (status === 'active') {
        updates.registration_date = new Date().toISOString().split('T')[0];
        updates.expiry_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year
      }
      
      if (notes) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('domains')
        .update(updates)
        .eq('id', domainId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-domains'] });
      toast({
        title: "Domain Updated",
        description: "Domain status has been updated successfully.",
      });
    }
  });

  // Update provisioning request
  const updateProvisioningRequest = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string, status: string, notes?: string }) => {
      const updates: any = { 
        status,
        processed_at: new Date().toISOString(),
        admin_notes: notes 
      };

      const { error } = await supabase
        .from('provisioning_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provisioning-requests'] });
      toast({
        title: "Request Updated",
        description: "Provisioning request has been updated successfully.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (domainsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Management</CardTitle>
          <CardDescription>Loading domain data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading domains...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Management
          </CardTitle>
          <CardDescription>
            Manage customer domains and provisioning requests
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domains">All Domains</TabsTrigger>
          <TabsTrigger value="requests">Provisioning Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Domains</CardTitle>
              <CardDescription>All customer domains in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains?.map((domain: any) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">
                        {domain.domain_name}{domain.tld}
                      </TableCell>
                      <TableCell>
                        {domain.profiles?.first_name} {domain.profiles?.last_name}
                        <br />
                        <span className="text-sm text-muted-foreground">{domain.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(domain.status)}>
                          {domain.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {domain.registration_date ? format(new Date(domain.registration_date), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>
                        {domain.expiry_date ? format(new Date(domain.expiry_date), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDomain(domain)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Domain</DialogTitle>
                              <DialogDescription>
                                Update domain status and add notes
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                  defaultValue={selectedDomain?.status}
                                  onValueChange={(value) => {
                                    updateDomainStatus.mutate({
                                      domainId: selectedDomain?.id,
                                      status: value
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                  placeholder="Add notes about this domain..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                />
                                <Button
                                  className="mt-2"
                                  onClick={() => {
                                    updateDomainStatus.mutate({
                                      domainId: selectedDomain?.id,
                                      status: selectedDomain?.status,
                                      notes
                                    });
                                    setNotes("");
                                  }}
                                >
                                  Update Notes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Requests</CardTitle>
              <CardDescription>Pending domain registration requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provisioningRequests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.domains?.domain_name}{request.domains?.tld}
                      </TableCell>
                      <TableCell>
                        {request.profiles?.first_name} {request.profiles?.last_name}
                        <br />
                        <span className="text-sm text-muted-foreground">{request.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Priority {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateProvisioningRequest.mutate({
                                requestId: request.id,
                                status: 'completed'
                              });
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateProvisioningRequest.mutate({
                                requestId: request.id,
                                status: 'failed'
                              });
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Fail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDomainManagement;
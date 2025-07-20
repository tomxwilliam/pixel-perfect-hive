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
import { Server, Play, Pause, Trash2, Eye, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminHostingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [notes, setNotes] = useState("");

  // Fetch all hosting subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-hosting-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting_subscriptions')
        .select(`
          *,
          hosting_packages!hosting_subscriptions_package_id_fkey(*),
          profiles!hosting_subscriptions_customer_id_fkey(first_name, last_name, email),
          invoices!hosting_subscriptions_invoice_id_fkey(status, amount, invoice_number),
          domains!hosting_subscriptions_domain_id_fkey(domain_name, tld)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch hosting provisioning requests
  const { data: hostingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['hosting-provisioning-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provisioning_requests')
        .select(`
          *,
          profiles!provisioning_requests_customer_id_fkey(first_name, last_name, email),
          hosting_subscriptions!provisioning_requests_entity_id_fkey(
            *,
            hosting_packages(package_name)
          )
        `)
        .eq('request_type', 'hosting_setup')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Provision hosting account
  const provisionHosting = useMutation({
    mutationFn: async ({ subscriptionId, action }: { subscriptionId: string, action: string }) => {
      const response = await supabase.functions.invoke('hosting-provision', {
        body: { 
          subscriptionId,
          action
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['hosting-provisioning-requests'] });
      toast({
        title: "Hosting Updated",
        description: "Hosting account has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Provisioning Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update subscription notes
  const updateSubscriptionNotes = useMutation({
    mutationFn: async ({ subscriptionId, notes }: { subscriptionId: string, notes: string }) => {
      const { error } = await supabase
        .from('hosting_subscriptions')
        .update({ notes })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      toast({
        title: "Notes Updated",
        description: "Subscription notes have been updated successfully.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-orange-500';
      case 'terminated': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (subscriptionsLoading || requestsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hosting Management</CardTitle>
          <CardDescription>Loading hosting data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Hosting Management
          </CardTitle>
          <CardDescription>
            Manage customer hosting subscriptions and provisioning
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">All Subscriptions</TabsTrigger>
          <TabsTrigger value="requests">Provisioning Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hosting Subscriptions</CardTitle>
              <CardDescription>All customer hosting accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.map((subscription: any) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.hosting_packages?.package_name}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          £{subscription.hosting_packages?.monthly_price}/month
                        </span>
                      </TableCell>
                      <TableCell>
                        {subscription.profiles?.first_name} {subscription.profiles?.last_name}
                        <br />
                        <span className="text-sm text-muted-foreground">{subscription.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        {subscription.domains?.domain_name ? 
                          `${subscription.domains.domain_name}${subscription.domains.tld}` : 
                          'No domain'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.billing_cycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.next_billing_date ? 
                          format(new Date(subscription.next_billing_date), 'PPP') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {subscription.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'create'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                          {subscription.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'suspend'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          {subscription.status === 'suspended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'unsuspend'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubscription(subscription)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Manage Hosting Account</DialogTitle>
                                <DialogDescription>
                                  Account details and management options
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedSubscription?.cpanel_username && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">cPanel Username</label>
                                      <p className="text-sm bg-muted p-2 rounded">
                                        {selectedSubscription.cpanel_username}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Server IP</label>
                                      <p className="text-sm bg-muted p-2 rounded">
                                        {selectedSubscription.server_ip || 'Not assigned'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <label className="text-sm font-medium">Notes</label>
                                  <Textarea
                                    placeholder="Add notes about this hosting account..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                  />
                                  <Button
                                    className="mt-2"
                                    onClick={() => {
                                      updateSubscriptionNotes.mutate({
                                        subscriptionId: selectedSubscription?.id,
                                        notes
                                      });
                                      setNotes("");
                                    }}
                                  >
                                    Update Notes
                                  </Button>
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to terminate this hosting account? This action cannot be undone.')) {
                                        provisionHosting.mutate({
                                          subscriptionId: selectedSubscription?.id,
                                          action: 'terminate'
                                        });
                                      }
                                    }}
                                    disabled={provisionHosting.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Terminate Account
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
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
              <CardDescription>Pending hosting setup requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostingRequests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.hosting_subscriptions?.hosting_packages?.package_name}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            provisionHosting.mutate({
                              subscriptionId: request.entity_id,
                              action: 'create'
                            });
                          }}
                          disabled={provisionHosting.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Provision
                        </Button>
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

export default AdminHostingManagement;
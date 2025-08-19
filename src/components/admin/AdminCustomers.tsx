
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Mail, Phone, Search, Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { CreateCustomerDialog } from './forms/CreateCustomerDialog';
import { CustomerDetailsModal } from './modals/CustomerDetailsModal';
import { EditCustomerModal } from './modals/EditCustomerModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

type Profile = Tables<'profiles'>;

interface CustomerWithStats extends Profile {
  project_count: number;
  ticket_count: number;
  total_spent: number;
}

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerWithStats | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      // Fetch customers with basic info first for instant loading
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .limit(100); // Limit for performance

      if (!profiles) return;

      // Set basic customer data immediately
      const basicCustomers = profiles.map(profile => ({
        ...profile,
        project_count: 0,
        ticket_count: 0,
        total_spent: 0
      })) as CustomerWithStats[];
      
      setCustomers(basicCustomers);
      setLoading(false); // Show customers immediately

      // Fetch additional stats in background
      const customersWithStats = await Promise.all(
        profiles.slice(0, 20).map(async (profile) => { // Limit concurrent requests
          try {
            const [projectsResult, ticketsResult, invoicesResult] = await Promise.all([
              supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('customer_id', profile.id),
              supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('customer_id', profile.id),
              supabase
                .from('invoices')
                .select('amount, status')
                .eq('customer_id', profile.id)
                .eq('status', 'paid') // Only paid invoices for performance
            ]);

            const totalSpent = invoicesResult.data
              ?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

            return {
              ...profile,
              project_count: projectsResult.count || 0,
              ticket_count: ticketsResult.count || 0,
              total_spent: totalSpent
            } as CustomerWithStats;
          } catch (error) {
            console.warn('Error fetching stats for customer:', profile.id, error);
            return {
              ...profile,
              project_count: 0,
              ticket_count: 0,
              total_spent: 0
            } as CustomerWithStats;
          }
        })
      );

      // Update with stats
      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerCreated = () => {
    fetchCustomers();
  };

  const handleViewCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer: CustomerWithStats) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      // Check for related records first
      const [quotesResult, invoicesResult, projectsResult, ticketsResult] = await Promise.all([
        supabase.from('quotes').select('id').eq('customer_id', customerToDelete.id).limit(1),
        supabase.from('invoices').select('id').eq('customer_id', customerToDelete.id).limit(1),
        supabase.from('projects').select('id').eq('customer_id', customerToDelete.id).limit(1),
        supabase.from('tickets').select('id').eq('customer_id', customerToDelete.id).limit(1)
      ]);

      const hasRelatedRecords = [quotesResult, invoicesResult, projectsResult, ticketsResult]
        .some(result => result.data && result.data.length > 0);

      if (hasRelatedRecords) {
        toast({
          title: "Error",
          description: "Cannot delete customer with existing quotes, invoices, projects, or tickets. Please remove these first.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) {
        console.error('Delete error:', error);
        if (error.code === '23503') {
          toast({
            title: "Error",
            description: "Cannot delete customer: has related records that must be removed first",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete customer: ${error.message}`,
            variant: "destructive",
          });
        }
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
        return;
      }

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      await fetchCustomers();
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
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

  // Mobile card layout
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            Manage your customers and view their activity
          </CardDescription>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <CreateCustomerDialog onCustomerCreated={handleCustomerCreated} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email}
                    </div>
                    {customer.company_name && (
                      <div className="text-sm text-muted-foreground">
                        {customer.company_name}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Projects:</span>
                      <Badge variant="outline">{customer.project_count}</Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Tickets:</span>
                      <Badge variant="outline">{customer.ticket_count}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">£{customer.total_spent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                  </div>
                </div>

                {(customer.email || customer.phone) && (
                  <div className="flex flex-col space-y-1 text-xs">
                    {customer.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Desktop table layout
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Management</CardTitle>
        <CardDescription>
          Manage your customers and view their activity
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          </div>
          <CreateCustomerDialog onCustomerCreated={handleCustomerCreated} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.company_name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {customer.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.project_count}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.ticket_count}</Badge>
                </TableCell>
                <TableCell>£{customer.total_spent.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedCustomer && (
        <>
          <CustomerDetailsModal
            customer={selectedCustomer}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
          <EditCustomerModal
            customer={selectedCustomer}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onCustomerUpdated={fetchCustomers}
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete?.first_name} ${customerToDelete?.last_name}?`}
        warningText="This will also delete all associated projects, tickets, quotes, and invoices. This action cannot be undone."
      />
    </Card>
  );
};

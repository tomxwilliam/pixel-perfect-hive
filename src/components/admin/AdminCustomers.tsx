
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Mail, Phone, Search } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { CreateCustomerDialog } from './forms/CreateCustomerDialog';
import { CustomerDetailsModal } from './modals/CustomerDetailsModal';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const fetchCustomers = async () => {
    try {
      // Fetch customers with basic info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      if (!profiles) return;

      // Fetch additional stats for each customer
      const customersWithStats = await Promise.all(
        profiles.map(async (profile) => {
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
          ]);

          const totalSpent = invoicesResult.data
            ?.filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

          return {
            ...profile,
            project_count: projectsResult.count || 0,
            ticket_count: ticketsResult.count || 0,
            total_spent: totalSpent
          } as CustomerWithStats;
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
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
                  <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                    <Eye className="h-4 w-4" />
                  </Button>
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
                  <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </Card>
  );
};


import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Eye, MessageSquare, User, Clock, Search } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Ticket = Tables<'tickets'>;
type Profile = Tables<'profiles'>;

interface TicketWithDetails extends Ticket {
  customer?: Profile | null;
  project?: { title: string } | null;
}

export const AdminTickets = () => {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // First fetch tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (ticketsError) {
          console.error('Error fetching tickets:', ticketsError);
          setLoading(false);
          return;
        }

        if (!ticketsData) {
          setTickets([]);
          setLoading(false);
          return;
        }

        // Fetch customer profiles separately
        const customerIds = [...new Set(ticketsData.map(ticket => ticket.customer_id))];
        const { data: customersData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', customerIds);

        // Fetch project details separately  
        const projectIds = [...new Set(ticketsData.map(ticket => ticket.project_id).filter(Boolean))];
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', projectIds);

        // Combine the data
        const ticketsWithDetails: TicketWithDetails[] = ticketsData.map(ticket => ({
          ...ticket,
          customer: customersData?.find(customer => customer.id === ticket.customer_id) || null,
          project: projectsData?.find(project => project.id === ticket.project_id) || null
        }));

        setTickets(ticketsWithDetails);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const customerName = ticket.customer ? `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.toLowerCase() : '';
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus as any })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus as any }
          : ticket
      ));
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Loading tickets...</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>
          Manage customer support requests and issues
        </CardDescription>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {ticket.description.slice(0, 50)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">
                        {ticket.customer 
                          ? `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.trim() || 'Unknown'
                          : 'Unknown Customer'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.customer?.email || 'No email'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.project?.title || 'General Support'}
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={ticket.status} 
                    onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Eye, MessageSquare, User, Clock, Search, Filter, 
  AlertTriangle, Timer, Paperclip, Users,
  ChevronDown, MoreHorizontal, ArrowUpDown
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SupportTicketModal } from './SupportTicketModal';
import { toast } from 'sonner';

type Ticket = Tables<'tickets'>;
type Profile = Tables<'profiles'>;
type Category = Tables<'ticket_categories'>;

interface TicketWithDetails extends Ticket {
  customer?: Profile | null;
  project?: { title: string } | null;
  category?: Category | null;
  attachments_count?: number;
  messages_count?: number;
  sla_status?: 'ok' | 'warning' | 'overdue';
  time_until_due?: string;
}

interface SupportTicketInboxProps {
  showAllTickets?: boolean;
}

export const SupportTicketInbox: React.FC<SupportTicketInboxProps> = ({ 
  showAllTickets = false 
}) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      setCategories(categoriesData || []);

      // Build query based on user role
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(*),
          customer:profiles!tickets_customer_id_fkey(*),
          project:projects(id, title)
        `);

      // If not admin or showAllTickets is false, filter to user's tickets
      if (!isAdmin || !showAllTickets) {
        query = query.eq('customer_id', user?.id);
      }

      const { data: ticketsData, error: ticketsError } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (ticketsError) throw ticketsError;

      if (!ticketsData) {
        setTickets([]);
        return;
      }

      // Enhance tickets with additional data
      const enhancedTickets = await Promise.all(
        ticketsData.map(async (ticket) => {
          // Get attachments count
          const { count: attachmentsCount } = await supabase
            .from('file_uploads')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'ticket')
            .eq('entity_id', ticket.id);

          // Get messages count
          const { count: messagesCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('related_type', 'ticket')
            .eq('related_id', ticket.id);

          // Calculate SLA status
          let slaStatus: 'ok' | 'warning' | 'overdue' = 'ok';
          let timeUntilDue = '';
          
          if (ticket.due_date && ticket.status !== 'closed' && ticket.status !== 'resolved') {
            const now = new Date();
            const dueDate = new Date(ticket.due_date);
            const timeUntilDueMs = dueDate.getTime() - now.getTime();
            const hoursUntilDue = timeUntilDueMs / (1000 * 60 * 60);
            
            if (hoursUntilDue < 0) {
              slaStatus = 'overdue';
              timeUntilDue = 'Overdue';
            } else if (hoursUntilDue < 2) {
              slaStatus = 'warning';
              timeUntilDue = `${Math.ceil(hoursUntilDue)}h left`;
            } else {
              timeUntilDue = `${Math.ceil(hoursUntilDue)}h left`;
            }
          }

          return {
            ...ticket,
            attachments_count: attachmentsCount || 0,
            messages_count: messagesCount || 0,
            sla_status: slaStatus,
            time_until_due: timeUntilDue
          } as TicketWithDetails;
        })
      );

      setTickets(enhancedTickets);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, sortBy, sortOrder, showAllTickets]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      case 'urgent': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getSlaColor = (slaStatus: string) => {
    switch (slaStatus) {
      case 'overdue': return 'text-destructive';
      case 'warning': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const customerName = ticket.customer ? 
      `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.toLowerCase() : '';
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.ticket_number && ticket.ticket_number.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category_id === categoryFilter;
    const matchesSla = slaFilter === 'all' || ticket.sla_status === slaFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesSla;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus as any })
        .in('id', Array.from(selectedTickets));

      if (error) throw error;

      toast.success(`Updated ${selectedTickets.size} tickets`);
      setSelectedTickets(new Set());
      fetchData();
    } catch (error) {
      console.error('Error updating tickets:', error);
      toast.error('Failed to update tickets');
    }
  };

  const handleTicketClick = (ticket: TicketWithDetails) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
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
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
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
            <MessageSquare className="h-5 w-5" />
            {showAllTickets ? 'All Support Tickets' : 'Ticket Inbox'}
          </CardTitle>
          <CardDescription>
            {isAdmin && showAllTickets 
              ? 'Manage all customer support requests' 
              : 'Professional ticket management system'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, customers, #numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={slaFilter} onValueChange={setSlaFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="SLA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SLA</SelectItem>
                <SelectItem value="ok">On Time</SelectItem>
                <SelectItem value="warning">Due Soon</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                <SelectItem value="priority-desc">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {isAdmin && selectedTickets.size > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedTickets.size} tickets selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkStatusUpdate('in_progress')}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusUpdate('resolved')}>
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusUpdate('closed')}>
                    Mark as Closed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTickets(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Professional Ticket Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {isAdmin && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tickets found</p>
                        <p className="text-sm">Try adjusting your filters or create a new ticket</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id} 
                      className={`hover:bg-muted/50 cursor-pointer ${selectedTickets.has(ticket.id) ? 'bg-muted/50' : ''}`}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      {isAdmin && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTickets.has(ticket.id)}
                            onCheckedChange={(checked) => handleSelectTicket(ticket.id, !!checked)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{ticket.title}</div>
                            {ticket.is_escalated && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent>Escalated ticket</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            #{ticket.ticket_number} • {ticket.description.slice(0, 60)}...
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
                        {ticket.category ? (
                          <Badge variant="outline" style={{ borderColor: ticket.category.color }}>
                            {ticket.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Uncategorized</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${getSlaColor(ticket.sla_status)}`}>
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {ticket.time_until_due || 'No SLA'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {ticket.attachments_count! > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Paperclip className="h-3 w-3" />
                                    {ticket.attachments_count}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {ticket.attachments_count} attachments
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="h-3 w-3" />
                                  {ticket.messages_count}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {ticket.messages_count} messages
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTicketClick(ticket)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem>
                                  <Users className="h-4 w-4 mr-2" />
                                  Assign Agent
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Escalate
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedTicket && (
        <SupportTicketModal
          ticket={selectedTicket}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onTicketUpdated={fetchData}
        />
      )}
    </div>
  );
};
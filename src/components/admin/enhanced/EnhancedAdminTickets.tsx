import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, MessageSquare, User, Clock, Search, Edit, Trash2, 
  AlertTriangle, FileText, Users, Timer, Filter, 
  Calendar, Tag, ChevronDown, MoreHorizontal, Paperclip
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Ticket = Tables<'tickets'>;
type Profile = Tables<'profiles'>;
type Category = Tables<'ticket_categories'>;

interface EnhancedTicketWithDetails extends Ticket {
  customer?: Profile | null;
  project?: { title: string } | null;
  category?: Category | null;
  attachments_count?: number;
  time_logged?: number;
  watchers_count?: number;
  last_message_at?: string;
  sla_status?: 'ok' | 'warning' | 'overdue';
}

export const EnhancedAdminTickets = () => {
  const [tickets, setTickets] = useState<EnhancedTicketWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

      // Fetch tickets with enhanced details
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(*),
          customer:profiles!tickets_customer_id_fkey(*),
          project:projects(id, title)
        `)
        .order('created_at', { ascending: false });

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
            .from('ticket_attachments')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);

          // Get total time logged
          const { data: timeLogs } = await supabase
            .from('ticket_time_logs')
            .select('hours_logged')
            .eq('ticket_id', ticket.id);

          const totalTime = timeLogs?.reduce((sum, log) => sum + Number(log.hours_logged), 0) || 0;

          // Get watchers count
          const { count: watchersCount } = await supabase
            .from('ticket_watchers')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);

          // Get last message timestamp
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('created_at')
            .eq('related_type', 'ticket')
            .eq('related_id', ticket.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Calculate SLA status
          let slaStatus: 'ok' | 'warning' | 'overdue' = 'ok';
          if (ticket.due_date && ticket.status !== 'closed' && ticket.status !== 'resolved') {
            const now = new Date();
            const dueDate = new Date(ticket.due_date);
            const timeUntilDue = dueDate.getTime() - now.getTime();
            const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
            
            if (hoursUntilDue < 0) {
              slaStatus = 'overdue';
            } else if (hoursUntilDue < 2) {
              slaStatus = 'warning';
            }
          }

          return {
            ...ticket,
            attachments_count: attachmentsCount || 0,
            time_logged: totalTime,
            watchers_count: watchersCount || 0,
            last_message_at: lastMessage?.created_at,
            sla_status: slaStatus
          } as EnhancedTicketWithDetails;
        })
      );

      setTickets(enhancedTickets);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const customerName = ticket.customer ? `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.toLowerCase() : '';
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus as any })
        .in('id', Array.from(selectedTickets));

      if (error) throw error;

      toast({ title: 'Success', description: `Updated ${selectedTickets.size} tickets` });
      setSelectedTickets(new Set());
      fetchData();
    } catch (error) {
      console.error('Error updating tickets:', error);
      toast({ title: 'Error', description: 'Failed to update tickets', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Support Tickets</CardTitle>
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
            Enhanced Support Tickets
          </CardTitle>
          <CardDescription>
            Advanced ticket management with categories, SLA tracking, and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets, customers, descriptions..."
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
          </div>

          {/* Bulk Actions */}
          {selectedTickets.size > 0 && (
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

          {/* Enhanced Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
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
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className={selectedTickets.has(ticket.id) ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.has(ticket.id)}
                      onCheckedChange={(checked) => handleSelectTicket(ticket.id, !!checked)}
                    />
                  </TableCell>
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
                        #{ticket.id.split('-')[0]} • {ticket.description.slice(0, 60)}...
                      </div>
                      {ticket.tags && ticket.tags.length > 0 && (
                        <div className="flex gap-1">
                          {ticket.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {ticket.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{ticket.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
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
                      {ticket.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {ticket.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {ticket.due_date && (
                        <div className={`text-sm flex items-center gap-1 ${getSlaColor(ticket.sla_status || 'ok')}`}>
                          <Clock className="h-3 w-3" />
                          {ticket.sla_status === 'overdue' ? 'Overdue' : 
                           ticket.sla_status === 'warning' ? 'Due Soon' : 'On Time'}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {ticket.attachments_count && ticket.attachments_count > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{ticket.attachments_count}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Attachments</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {ticket.time_logged && ticket.time_logged > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                <span>{ticket.time_logged}h</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Time logged</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {ticket.watchers_count && ticket.watchers_count > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{ticket.watchers_count}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Watchers</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Ticket
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Timer className="h-4 w-4 mr-2" />
                            Log Time
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Manage Watchers
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Add Internal Note
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
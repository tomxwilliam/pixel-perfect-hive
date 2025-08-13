import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Ticket, Clock, AlertCircle, MessageSquare, Search, Plus, 
  Paperclip, Star, Tag, Calendar, Timer
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { CustomerTicketDetailsModal } from '../TicketDetailsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type TicketData = Tables<'tickets'>;
type Category = Tables<'ticket_categories'>;

interface EnhancedTicketData extends Omit<TicketData, 'satisfaction_rating'> {
  category?: Category | null;
  attachments_count?: number;
  messages_count?: number;
  last_message_at?: string;
  satisfaction_rating?: number;
  sla_status?: 'ok' | 'warning' | 'overdue';
}

export const EnhancedCustomerTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<EnhancedTicketData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      setCategories(categoriesData || []);

      // Fetch tickets with category data
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) {
        setTickets([]);
        return;
      }

      // Enhance tickets with additional data
      const enhancedTickets = await Promise.all(
        data.map(async (ticket) => {
          // Get attachments count
          const { count: attachmentsCount } = await supabase
            .from('ticket_attachments')
            .select('*', { count: 'exact', head: true })
            .eq('ticket_id', ticket.id);

          // Get messages count and last message
          const { data: messagesData } = await supabase
            .from('messages')
            .select('created_at')
            .eq('related_type', 'ticket')
            .eq('related_id', ticket.id)
            .order('created_at', { ascending: false });

          const messagesCount = messagesData?.length || 0;
          const lastMessageAt = messagesData?.[0]?.created_at;

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
            messages_count: messagesCount,
            last_message_at: lastMessageAt,
          sla_status: slaStatus
          } as EnhancedTicketData;
        })
      );

      setTickets(enhancedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Real-time subscription
    const channel = supabase
      .channel('customer-tickets-enhanced')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user?.id}` },
        () => fetchTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'urgent': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
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
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleTicketClick = (ticket: EnhancedTicketData) => {
    setSelectedTicket(ticket as TicketData);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Loading your support tickets...</CardDescription>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Support Tickets
            </CardTitle>
            <CardDescription>
              Track and manage your support requests with enhanced features
            </CardDescription>
          </div>
          <Link to="/dashboard/tickets/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
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
        </div>
      </CardHeader>
      
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No support tickets</p>
            <Link to="/dashboard/tickets/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="border rounded-lg p-6 hover:bg-muted/20 transition-colors cursor-pointer group"
                onClick={() => handleTicketClick(ticket)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{ticket.title}</h4>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        #{ticket.id.split('-')[0]}
                      </span>
                      {ticket.satisfaction_rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${
                                i < ticket.satisfaction_rating! 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {ticket.description}
                    </p>

                    {/* Tags */}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {ticket.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {ticket.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{ticket.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {ticket.category && (
                        <Badge variant="outline" style={{ borderColor: ticket.category.color }}>
                          {ticket.category.name}
                        </Badge>
                      )}
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority === 'high' || ticket.priority === 'urgent' ? (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        ) : null}
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {/* SLA Indicator */}
                    {ticket.due_date && ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                      <div className={`text-xs flex items-center gap-1 ${getSlaColor(ticket.sla_status || 'ok')}`}>
                        <Clock className="h-3 w-3" />
                        {ticket.sla_status === 'overdue' ? 'Response Overdue' : 
                         ticket.sla_status === 'warning' ? 'Response Due Soon' : 
                         `Due: ${new Date(ticket.due_date).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Activity indicators */}
                    <div className="flex items-center gap-3">
                      {ticket.attachments_count && ticket.attachments_count > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-4 w-4" />
                                <span>{ticket.attachments_count}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>File attachments</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <div className="flex items-center gap-1 text-primary group-hover:text-primary/80">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.messages_count || 0} messages</span>
                      </div>
                    </div>
                    
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded group-hover:bg-primary/20">
                      View & Reply
                    </span>
                  </div>
                </div>

                {/* Last activity */}
                {ticket.last_message_at && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last activity: {new Date(ticket.last_message_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {selectedTicket && (
        <CustomerTicketDetailsModal
          ticket={selectedTicket}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </Card>
  );
};
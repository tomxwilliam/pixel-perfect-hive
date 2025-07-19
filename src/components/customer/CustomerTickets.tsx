
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Ticket, Clock, AlertCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type TicketData = Tables<'tickets'>;

export const CustomerTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
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
      .channel('customer-tickets')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `customer_id=eq.${user?.id}` },
        () => fetchTickets()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
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
              <div key={i} className="h-20 bg-muted rounded"></div>
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
              View and track your support requests
            </CardDescription>
          </div>
          <Link to="/dashboard/tickets/new">
            <Button size="sm">New Ticket</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No support tickets</p>
            <Link to="/dashboard/tickets/new">
              <Button className="mt-4" size="sm">
                Get Help
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {ticket.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    Updated: {new Date(ticket.updated_at).toLocaleDateString()}
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

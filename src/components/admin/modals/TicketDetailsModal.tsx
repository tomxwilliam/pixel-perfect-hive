import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { MessageSquare, User, Calendar, AlertCircle, Send, FileText } from 'lucide-react';
import { toast } from 'sonner';

type Ticket = Tables<'tickets'>;
type Profile = Tables<'profiles'>;
type Message = Tables<'messages'> & {
  sender?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
};

interface TicketWithDetails extends Ticket {
  customer?: Profile | null;
  project?: { title: string } | null;
}

interface TicketDetailsModalProps {
  ticket: TicketWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdated: () => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  open,
  onOpenChange,
  onTicketUpdated
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [newPriority, setNewPriority] = useState(ticket.priority);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (open && ticket.id) {
      fetchMessages();
      setNewStatus(ticket.status);
      setNewPriority(ticket.priority);
    }
  }, [open, ticket.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, email, role)
        `)
        .eq('related_type', 'ticket')
        .eq('related_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as any) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load ticket messages');
    }
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: newStatus as any,
          priority: newPriority as any
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast.success('Ticket updated successfully');
      onTicketUpdated();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: ticket.customer_id,
          content: newMessage,
          type: 'message',
          subject: `Re: ${ticket.title}`,
          related_type: 'ticket',
          related_id: ticket.id
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(); // Refresh messages
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Customer</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {ticket.customer 
                            ? `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.trim() || 'Unknown'
                            : 'Unknown Customer'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {ticket.customer?.email || 'No email'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Project</label>
                      <p className="text-sm mt-1">{ticket.project?.title || 'General Support'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Created</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(ticket.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={newPriority} onValueChange={(value) => setNewPriority(value as any)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={loading || (newStatus === ticket.status && newPriority === ticket.priority)}
                      size="sm"
                    >
                      {loading ? 'Updating...' : 'Update Ticket'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                  {ticket.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No messages yet</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {message.sender?.first_name} {message.sender?.last_name}
                          </span>
                          <Badge variant={message.sender?.role === 'admin' ? 'default' : 'secondary'}>
                            {message.sender?.role || 'customer'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))
                )}

                {/* New Message */}
                <div className="border-t pt-4">
                  <label className="text-sm font-medium">Reply to Customer</label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    rows={3}
                    className="mt-2"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="mt-2"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingMessage ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
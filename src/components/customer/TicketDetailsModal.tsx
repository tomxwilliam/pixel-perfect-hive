import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { MessageSquare, User, Calendar, AlertCircle, Send, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

type Ticket = Tables<'tickets'>;
type Message = Tables<'messages'> & {
  sender?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
};

interface CustomerTicketDetailsModalProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerTicketDetailsModal: React.FC<CustomerTicketDetailsModalProps> = ({
  ticket,
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && ticket.id) {
      fetchMessages();
    }
  }, [open, ticket.id]);

  const fetchMessages = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSendingMessage(true);
    try {
      // Find an admin to send the message to (get first admin from profiles)
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminError || !adminProfile) {
        // Fallback: send to ticket creator or use current user as recipient
        console.warn('No admin found, using fallback');
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: adminProfile?.id || user.id, // Fallback to user if no admin found
          content: newMessage,
          type: 'message',
          subject: `Re: ${ticket.title}`,
          related_type: 'ticket',
          related_id: ticket.id
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(); // Refresh messages
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

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

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {ticket.title}
            <span className="text-sm text-muted-foreground font-normal">
              #{ticket.id.split('-')[0]}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      <Badge variant={getStatusColor(ticket.status)}>
                        {formatStatus(ticket.status)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <div className="mt-1 flex items-center gap-1">
                      {ticket.priority === 'high' || ticket.priority === 'urgent' ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                      <Badge variant={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(ticket.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Description</label>
                <div className="text-sm mt-1 p-3 bg-muted rounded border">
                  {ticket.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`border rounded-lg p-4 ${
                        message.sender?.role === 'admin' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-full ${
                            message.sender?.role === 'admin' 
                              ? 'bg-blue-100' 
                              : 'bg-green-100'
                          }`}>
                            <User className="h-3 w-3" />
                          </div>
                          <span className="font-medium text-sm">
                            {message.sender?.role === 'admin' ? 'Support Team' : 'You'}
                          </span>
                          <Badge 
                            variant={message.sender?.role === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {message.sender?.role === 'admin' ? 'Staff' : 'Customer'}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed">{message.content}</div>
                    </div>
                  ))
                )}

                {/* Only show reply box if ticket is not closed */}
                {ticket.status !== 'closed' && (
                  <div className="border-t pt-4 mt-6">
                    <label className="text-sm font-medium">Add a Reply</label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="mt-2"
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim() || sendingMessage}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingMessage ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                )}

                {ticket.status === 'closed' && (
                  <div className="border-t pt-4 mt-6">
                    <div className="text-center py-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        This ticket has been closed. No new replies can be added.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
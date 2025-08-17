import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { 
  MessageSquare, User, Calendar, AlertCircle, Send, FileText, 
  Clock, Timer, Paperclip, Star, ThumbsUp, ThumbsDown,
  Edit, Flag, Users, Eye
} from 'lucide-react';
import { toast } from 'sonner';

type Ticket = Tables<'tickets'>;
type Profile = Tables<'profiles'>;
type Message = Tables<'messages'> & {
  sender?: Profile;
};
type FileUpload = Tables<'file_uploads'>;

interface TicketWithDetails extends Ticket {
  customer?: Profile | null;
  project?: { title: string } | null;
  category?: { name: string; color: string } | null;
}

interface SupportTicketModalProps {
  ticket: TicketWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketUpdated: () => void;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  ticket,
  open,
  onOpenChange,
  onTicketUpdated
}) => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isCustomer = !isAdmin;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [newPriority, setNewPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assigned_to || '');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [internalNote, setInternalNote] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);

  useEffect(() => {
    if (open && ticket.id) {
      fetchTicketData();
      setNewStatus(ticket.status);
      setNewPriority(ticket.priority);
      setAssignedTo(ticket.assigned_to || '');
    }
  }, [open, ticket.id]);

  const fetchTicketData = async () => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('related_type', 'ticket')
        .eq('related_id', ticket.id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages((messagesData as any) || []);

      // Fetch attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('entity_type', 'ticket')
        .eq('entity_id', ticket.id);

      if (attachmentsError) throw attachmentsError;
      setAttachments(attachmentsData || []);

      // Fetch admins for assignment (admin only)
      if (isAdmin) {
        const { data: adminsData, error: adminsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'admin');

        if (adminsError) throw adminsError;
        setAdmins(adminsData || []);
      }

    } catch (error) {
      console.error('Error fetching ticket data:', error);
      toast.error('Failed to load ticket data');
    }
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const updates: any = {
        status: newStatus,
        priority: newPriority,
        updated_at: new Date().toISOString()
      };

      if (isAdmin && assignedTo) {
        updates.assigned_to = assignedTo;
      }

      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updates)
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
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          recipient_id: isAdmin ? ticket.customer_id : null,
          content: newMessage,
          type: 'message',
          subject: `Re: ${ticket.title}`,
          related_type: 'ticket',
          related_id: ticket.id
        });

      if (error) throw error;

      // Update first response time if this is the first admin response
      if (isAdmin && !ticket.first_response_at) {
        await supabase
          .from('tickets')
          .update({ first_response_at: new Date().toISOString() })
          .eq('id', ticket.id);
      }

      setNewMessage('');
      fetchTicketData();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInternalNote = async () => {
    if (!internalNote.trim() || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('ticket_internal_notes')
        .insert({
          ticket_id: ticket.id,
          user_id: user!.id,
          note: internalNote
        });

      if (error) throw error;

      setInternalNote('');
      toast.success('Internal note added');
    } catch (error) {
      console.error('Error adding internal note:', error);
      toast.error('Failed to add internal note');
    }
  };

  const handleSatisfactionRating = async (rating: number) => {
    if (!isCustomer) return;

    try {
      const { error } = await supabase
        .from('ticket_surveys')
        .upsert({
          ticket_id: ticket.id,
          rating: rating
        });

      if (error) throw error;

      setSatisfaction(rating);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ticket #{ticket.ticket_number} - {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ticket Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {ticket.customer 
                          ? `${ticket.customer.first_name || ''} ${ticket.customer.last_name || ''}`.trim() || 'Unknown'
                          : 'Unknown Customer'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.customer?.email || 'No email'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                    <div className="mt-2 space-y-2">
                      {attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{file.filename}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.file_size)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages/Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No messages yet</p>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 rounded-lg ${
                          message.sender?.role === 'admin' 
                            ? 'bg-blue-50 dark:bg-blue-950/20 ml-8' 
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              {message.sender?.first_name} {message.sender?.last_name}
                            </span>
                            <Badge variant={message.sender?.role === 'admin' ? 'default' : 'secondary'}>
                              {message.sender?.role === 'admin' ? 'Support Agent' : 'Customer'}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Message */}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <label className="text-sm font-medium">
                    {isAdmin ? 'Reply to Customer' : 'Send Message'}
                  </label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Satisfaction (for resolved tickets) */}
            {isCustomer && ticket.status === 'resolved' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rate Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    How satisfied are you with the resolution of this ticket?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={satisfaction === rating ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSatisfactionRating(rating)}
                      >
                        <Star className="h-4 w-4" />
                        {rating}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  {isAdmin ? (
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
                  ) : (
                    <div className="mt-1">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  {isAdmin ? (
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
                  ) : (
                    <div className="mt-1">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {admins.map((admin) => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.first_name} {admin.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {isAdmin && (
                  <Button 
                    onClick={handleStatusUpdate} 
                    disabled={loading || (
                      newStatus === ticket.status && 
                      newPriority === ticket.priority && 
                      assignedTo === (ticket.assigned_to || '')
                    )}
                    className="w-full"
                  >
                    {loading ? 'Updating...' : 'Update Ticket'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* SLA Timer */}
            {ticket.due_date && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    SLA Timer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {new Date(ticket.due_date) > new Date() 
                        ? Math.ceil((new Date(ticket.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60))
                        : 0
                      }h
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.due_date) > new Date() ? 'Time remaining' : 'Overdue'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Internal Notes (Admin Only) */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Add internal note (visible to staff only)"
                    rows={3}
                  />
                  <Button 
                    onClick={handleInternalNote}
                    disabled={!internalNote.trim()}
                    size="sm"
                    className="w-full"
                  >
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
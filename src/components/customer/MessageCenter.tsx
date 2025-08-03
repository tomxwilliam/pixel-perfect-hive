import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Clock,
  Mail,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;

interface MessageWithSender extends Message {
  sender?: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
  recipient?: {
    first_name: string;
    last_name: string;
    role: string;
  } | null;
}

export const MessageCenter = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipient_id: ''
  });
  const [admins, setAdmins] = useState<any[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, role),
          recipient:profiles!messages_recipient_id_fkey(first_name, last_name, role)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'admin');

      if (error) throw error;
      setAdmins(data || []);
      
      // Auto-select the first admin if only one exists
      if (data && data.length === 1) {
        setNewMessage(prev => ({ ...prev, recipient_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchAdmins();

    // Real-time subscription for new messages
    const channel = supabase
      .channel('user-messages')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages', 
          filter: `or(sender_id.eq.${user?.id},recipient_id.eq.${user?.id})` 
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.content.trim() || !newMessage.recipient_id) {
      toast({
        title: "Missing Information",
        description: "Please enter a message and select a recipient.",
        variant: "destructive"
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          recipient_id: newMessage.recipient_id,
          subject: newMessage.subject || 'Message from Customer',
          content: newMessage.content,
          type: 'message'
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });

      setNewMessage({ subject: '', content: '', recipient_id: '' });
      setShowNewMessage(false);
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('recipient_id', user?.id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
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
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages
            </CardTitle>
            <CardDescription>
              Communicate directly with our team
            </CardDescription>
          </div>
          <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={sendMessage} className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <select
                    id="recipient"
                    value={newMessage.recipient_id}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient_id: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                    required
                  >
                    <option value="">Select recipient...</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.first_name} {admin.last_name} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewMessage(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? 'Sending...' : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with our team</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {messages.map((message) => {
                const isReceived = message.recipient_id === user?.id;
                const isUnread = isReceived && !message.read;
                
                return (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 transition-all hover:bg-muted/20 ${
                      isUnread ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <User className="h-4 w-4" />
                           <span className="font-medium">
                             {isReceived 
                               ? `From: ${message.sender?.first_name || ''} ${message.sender?.last_name || ''} (${message.sender?.role || 'Admin'})`
                               : `To: ${message.recipient?.first_name || ''} ${message.recipient?.last_name || ''} (${message.recipient?.role || 'Admin'})`
                             }
                           </span>
                           <Badge variant={isReceived ? 'default' : 'secondary'}>
                             {isReceived ? 'Received' : 'Sent'}
                           </Badge>
                           {isUnread && (
                             <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                           )}
                         </div>
                        
                        {message.subject && (
                          <h4 className="font-medium mb-2">{message.subject}</h4>
                        )}
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(message.created_at))} ago
                        </div>
                      </div>
                      
                      {isUnread && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(message.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
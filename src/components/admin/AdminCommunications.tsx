
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateNotificationDialog } from '@/components/admin/forms/CreateNotificationDialog';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Bot,
  ExternalLink,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  content: string;
  sent_at: string;
  ai_generated: boolean;
  email_type?: string;
  customer_id?: string;
}

interface AIConversation {
  id: string;
  customer_id?: string;
  ticket_id?: string;
  conversation_data: any;
  ai_response?: string;
  created_at: string;
  human_intervention: boolean;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  ai_generated: boolean;
  posted_at?: string;
  scheduled_for?: string;
  post_id?: string;
  created_at: string;
}

export const AdminCommunications = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [aiConversations, setAIConversations] = useState<AIConversation[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState<'all' | 'ai' | 'manual'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunicationData();

    // Set up real-time subscriptions
    const emailChannel = supabase
      .channel('email-logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'email_logs' }, () => {
        fetchEmailLogs();
        toast({
          title: "New Email Activity",
          description: "Email logs have been updated",
        });
      })
      .subscribe();

    const aiChannel = supabase
      .channel('ai-conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_conversations' }, () => {
        fetchAIConversations();
        toast({
          title: "New AI Activity",
          description: "AI conversations have been updated",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(emailChannel);
      supabase.removeChannel(aiChannel);
    };
  }, [toast]);

  const fetchCommunicationData = async () => {
    await Promise.all([
      fetchEmailLogs(),
      fetchAIConversations(),
      fetchSocialPosts()
    ]);
    setLoading(false);
  };

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const fetchAIConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAIConversations(data || []);
    } catch (error) {
      console.error('Error fetching AI conversations:', error);
    }
  };

  const fetchSocialPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSocialPosts(data || []);
    } catch (error) {
      console.error('Error fetching social posts:', error);
    }
  };

  const getFilteredEmails = () => {
    let filtered = emailLogs;

    if (emailFilter !== 'all') {
      filtered = filtered.filter(email => 
        emailFilter === 'ai' ? email.ai_generated : !email.ai_generated
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredConversations = () => {
    if (!searchTerm) return aiConversations;
    
    return aiConversations.filter(conv =>
      conv.ai_response?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(conv.conversation_data).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-muted-foreground">Email campaigns, AI chat logs, and customer communications</p>
        </div>
        <CreateNotificationDialog onNotificationCreated={fetchCommunicationData} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="emails" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Logs ({emailLogs.length})
          </TabsTrigger>
          <TabsTrigger value="ai-chats" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Conversations ({aiConversations.length})
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Social Posts ({socialPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Communications</h3>
            <Select value={emailFilter} onValueChange={(value: any) => setEmailFilter(value)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="ai">AI Generated</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {getFilteredEmails().length > 0 ? (
              getFilteredEmails().map((email) => (
                <Card key={email.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{email.subject}</span>
                        {email.ai_generated && (
                          <Badge variant="secondary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        {email.email_type && (
                          <Badge variant="outline">{email.email_type}</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(email.sent_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>To:</strong> {email.recipient_email}
                      </div>
                      <div className="text-sm bg-muted p-3 rounded max-h-20 overflow-y-auto">
                        {email.content.length > 200 
                          ? email.content.substring(0, 200) + '...'
                          : email.content
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No email communications found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-chats" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Conversations</h3>
            <Badge variant="outline">{aiConversations.length} total conversations</Badge>
          </div>

          <div className="space-y-4">
            {getFilteredConversations().length > 0 ? (
              getFilteredConversations().map((conversation) => (
                <Card key={conversation.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">AI Conversation</span>
                        {conversation.human_intervention && (
                          <Badge variant="destructive">Human Intervention</Badge>
                        )}
                        {conversation.ticket_id && (
                          <Badge variant="outline">Ticket Support</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(conversation.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {conversation.ai_response && (
                        <div className="text-sm bg-muted p-3 rounded">
                          <strong>AI Response:</strong>
                          <p className="mt-1">
                            {conversation.ai_response.length > 200 
                              ? conversation.ai_response.substring(0, 200) + '...'
                              : conversation.ai_response
                            }
                          </p>
                        </div>
                      )}
                      
                      {conversation.conversation_data && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View conversation data
                          </summary>
                          <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(conversation.conversation_data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No AI conversations found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Social Media Posts</h3>
            <Badge variant="outline">{socialPosts.length} total posts</Badge>
          </div>

          <div className="space-y-4">
            {socialPosts.length > 0 ? (
              socialPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{post.platform}</Badge>
                        {post.ai_generated && (
                          <Badge variant="secondary">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        {post.posted_at ? (
                          <Badge variant="default">Posted</Badge>
                        ) : post.scheduled_for ? (
                          <Badge variant="secondary">Scheduled</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {post.posted_at 
                          ? new Date(post.posted_at).toLocaleString()
                          : post.scheduled_for
                          ? `Scheduled: ${new Date(post.scheduled_for).toLocaleString()}`
                          : new Date(post.created_at).toLocaleString()
                        }
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm bg-muted p-3 rounded">
                        {post.content}
                      </div>
                      
                      {post.post_id && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Post
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No social media posts found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

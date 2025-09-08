import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, Bot, User, Sparkles, Loader2, Brain, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  tools?: any[];
}

interface AIResponse {
  response: string;
  tool_results?: any[];
  next_action?: string;
  escalation_needed?: boolean;
}

const AIChat = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${profile?.first_name || 'there'}! I'm the 404 Code Lab Portal AI, your autonomous operations brain. I can help with support tickets, sales quotes, project management, billing, and comprehensive customer assistance. How can I help you today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('portal-ai', {
        body: {
          query: currentQuery,
          context: 'general',
          user_role: profile?.role || 'customer',
          user_id: user.id,
          ticket_id: null,
          contact_id: user.id
        }
      });

      if (error) throw error;
      
      const aiResponse: AIResponse = data;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        isUser: false,
        timestamp: new Date(),
        tools: aiResponse.tool_results
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Show escalation notice
      if (aiResponse.escalation_needed) {
        toast({
          title: "Escalation Notice",
          description: "Your request has been noted for human team review.",
          variant: "default"
        });
      }
      
      // Show tool results
      if (aiResponse.tool_results?.length) {
        toast({
          title: "Action Completed",
          description: `I've processed your request using ${aiResponse.tool_results.length} system operation(s).`,
        });
      }
      
    } catch (error) {
      console.error('Portal AI error:', error);
      toast({
        title: "AI Assistant Error",
        description: "I apologize for the error. Let me escalate this to our human team.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I encountered an error and have escalated this to our human support team. They will be with you shortly.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Help me plan a mobile app project",
    "Create a support ticket for my website issue", 
    "I need a quote for an e-commerce website",
    "Show me my project progress",
    "Help with billing and invoices",
    "I need technical architecture advice"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center">
              <Brain className="h-8 w-8 mr-3 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Portal AI Assistant</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">404 Code Lab Operations Brain</p>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    UK Compliant
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    GMT
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Card className="h-[700px] flex flex-col border-0 shadow-lg">
            <CardHeader className="flex-shrink-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
              <CardTitle className="flex items-center text-lg">
                <Bot className="h-6 w-6 mr-2 text-primary" />
                404 Code Lab Portal AI
              </CardTitle>
              <CardDescription className="text-sm">
                Your autonomous operations assistant for support, sales, projects, and comprehensive customer service
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 mb-6">
                <div className="space-y-4 pr-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        {!message.isUser && (
                          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Brain className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`rounded-xl px-4 py-3 shadow-sm ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.tools && message.tools.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <Separator className="my-2" />
                              <div className="text-xs opacity-75">System Operations:</div>
                              {message.tools.map((tool: any, toolIndex: number) => (
                                <Badge key={toolIndex} variant="secondary" className="text-xs mr-1">
                                  {tool.success ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {tool.data?.ticket_id ? `Ticket #${tool.data.ticket_number}` : 
                                   tool.data?.quote_id ? `Quote Created` :
                                   tool.data?.project_id ? `Project Created` : 
                                   'Operation Complete'}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.isUser && (
                          <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Brain className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Processing your request...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-3">Try asking:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(action)}
                      className="text-xs text-left justify-start hover:bg-primary/10 h-auto p-3 border border-border/50 hover:border-primary/20 transition-colors"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                      <span className="text-left">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-3 border-t pt-4">
                <Textarea
                  placeholder="Ask me anything about 404 Code Lab services..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="resize-none h-24 text-sm border-border/50 focus:border-primary transition-colors"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setInputMessage('')}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                  >
                    <span className="sr-only">Clear</span>
                    ×
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
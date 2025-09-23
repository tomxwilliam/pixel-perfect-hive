import React, { useState, useEffect, useRef } from 'react';
import { StaticNavigation } from '@/components/StaticNavigation';
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setIsTyping(true);

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
      setIsTyping(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-accent/5">
      <StaticNavigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mr-4 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <div className="relative">
                  <Brain className="h-8 w-8 mr-3 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Portal AI Assistant</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">404 Code Lab Operations Brain</p>
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      UK Compliant
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl h-[75vh] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 px-6 py-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">404 Code Lab Portal AI</h3>
                    <p className="text-xs text-muted-foreground">Online • Autonomous Operations Assistant</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Clock className="h-3 w-3 mr-1" />
                  GMT
                </Badge>
              </div>
            </div>
            
            {/* Chat Content */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-muted/5 to-background/50">
              {/* Messages Area */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex items-end space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!message.isUser && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                            <Brain className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        {message.isUser && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-muted-foreground flex items-center justify-center shadow-md">
                            <User className="h-4 w-4 text-secondary-foreground" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm max-w-full ${
                            message.isUser
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto'
                              : 'bg-card border border-border/50 text-card-foreground'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          {message.tools && message.tools.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <Separator className="opacity-30" />
                              <div className="text-xs font-medium opacity-75 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                System Operations:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {message.tools.map((tool: any, toolIndex: number) => (
                                  <Badge key={toolIndex} variant="secondary" className="text-xs px-2 py-1 rounded-full">
                                    {tool.success ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {tool.data?.ticket_id ? `Ticket #${tool.data.ticket_number}` : 
                                     tool.data?.quote_id ? `Quote Created` :
                                     tool.data?.project_id ? `Project Created` : 
                                     'Operation Complete'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={`text-xs mt-2 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                            <span className={`${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(isLoading || isTyping) && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-end space-x-3 max-w-[80%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                          <Brain className="h-4 w-4 text-primary-foreground animate-pulse" />
                        </div>
                        <div className="bg-card border border-border/50 text-card-foreground rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm">Processing your request...</span>
                          </div>
                          <div className="flex space-x-1 mt-2">
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Quick Actions</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setInputMessage(action)}
                      className="text-xs text-left justify-start h-auto p-3 rounded-lg bg-background/80 hover:bg-background border border-border/30 hover:border-primary/30 transition-colors"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-primary" />
                      <span className="text-left">{action}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-border/30 bg-background/50 p-4">
                <div className="relative mb-3">
                  <Textarea
                    placeholder="Ask me anything about 404 Code Lab services..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    className="resize-none h-16 text-sm rounded-xl pr-12 bg-background border-border/50 focus:border-primary/50 transition-colors"
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                    {inputMessage.length}/500
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 text-sm"
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
                    className="h-10 px-4 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                  >
                    Clear
                  </Button>
        </div>
      </div>
    </div>
  );
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
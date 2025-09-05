import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Send, Loader2, Brain, AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PortalAIChatProps {
  context?: "support" | "sales" | "project" | "general";
  ticketId?: string;
  contactId?: string;
  onActionRequired?: (action: string) => void;
}

interface AIResponse {
  response: string;
  tool_results?: any[];
  next_action?: string;
  escalation_needed?: boolean;
}

export function PortalAIChat({ 
  context = "general", 
  ticketId, 
  contactId,
  onActionRequired 
}: PortalAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai', message: string, timestamp: Date, tools?: any }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleAIQuery = async () => {
    if (!query.trim() || !user) return;
    
    const userMessage = { type: 'user' as const, message: query, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('portal-ai', {
        body: {
          query,
          context,
          user_role: profile?.role || 'customer',
          user_id: user.id,
          ticket_id: ticketId,
          contact_id: contactId
        }
      });

      if (error) throw error;
      
      const aiResponse: AIResponse = data;
      const aiMessage = {
        type: 'ai' as const,
        message: aiResponse.response,
        timestamp: new Date(),
        tools: aiResponse.tool_results
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Handle next actions
      if (aiResponse.next_action && onActionRequired) {
        onActionRequired(aiResponse.next_action);
      }
      
      // Show escalation notice
      if (aiResponse.escalation_needed) {
        toast({
          title: "Human Support Required",
          description: "I'm escalating this to our human team for immediate assistance.",
          variant: "destructive"
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
      
      const errorMessage = {
        type: 'ai' as const,
        message: "I encountered an error and have escalated this to our human support team. They will be with you shortly.",
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextInfo = () => {
    switch (context) {
      case 'support':
        return {
          title: "404 Code Lab Support AI",
          description: "I can help resolve issues, create tickets, and provide technical assistance.",
          examples: [
            "My website is down, can you help?",
            "Create a ticket for billing inquiry",
            "I need help with my hosting account"
          ]
        };
      case 'sales':
        return {
          title: "404 Code Lab Sales AI",
          description: "I can generate quotes, explain services, and help with project planning.",
          examples: [
            "I need a quote for an e-commerce website",
            "What's included in your app development service?",
            "Can you estimate costs for a booking system?"
          ]
        };
      case 'project':
        return {
          title: "404 Code Lab Project AI",
          description: "I can help with project management, tasks, and progress tracking.",
          examples: [
            "Update me on project progress",
            "Create a new task for testing phase",
            "What's the timeline for the mobile app?"
          ]
        };
      default:
        return {
          title: "404 Code Lab Portal AI",
          description: "I'm your comprehensive operations assistant for all 404 Code Lab services.",
          examples: [
            "Help me get started with a new project",
            "I have a technical issue that needs resolving",
            "Can you create a quote for web development?"
          ]
        };
    }
  };

  const contextInfo = getContextInfo();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl border-2 border-primary/20"
      >
        <Brain className="h-8 w-8" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] shadow-2xl border-primary/20 flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle className="text-sm">{contextInfo.title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{contextInfo.description}</p>
        
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            UK Compliant
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            GMT
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {conversation.length === 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Try asking:</div>
              {contextInfo.examples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-3 text-xs text-left justify-start hover:bg-primary/10 w-full"
                  onClick={() => setQuery(example)}
                >
                  <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                  {example}
                </Button>
              ))}
            </div>
          )}
          
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <div className="text-sm">{msg.message}</div>
                {msg.tools && msg.tools.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <Separator className="my-2" />
                    <div className="text-xs opacity-75">System Operations:</div>
                    {msg.tools.map((tool: any, toolIndex: number) => (
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
                <div className="text-xs opacity-50 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="space-y-2 flex-shrink-0">
          <Textarea
            placeholder="Ask me anything about 404 Code Lab services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="resize-none h-20 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIQuery();
              }
            }}
          />
          <Button
            onClick={handleAIQuery}
            disabled={!query.trim() || isLoading}
            className="w-full"
            size="sm"
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
        </div>
      </CardContent>
    </Card>
  );
}
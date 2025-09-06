import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Brain, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AIAssistantProps {
  context: "project" | "contact";
  onSuggestion?: (suggestion: string) => void;
}

interface AIResponse {
  response: string;
  tool_results?: any[];
  next_action?: string;
  escalation_needed?: boolean;
}

export function AIAssistant({ context, onSuggestion }: AIAssistantProps) {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<Array<{ type: 'user' | 'ai', message: string, timestamp: Date, tools?: any }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const aiContext = context === "project" ? "project" : "sales";

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
          context: aiContext,
          user_role: profile?.role || 'customer',
          user_id: user.id,
          ticket_id: null,
          contact_id: user.id
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
      if (aiResponse.next_action && onSuggestion) {
        onSuggestion(aiResponse.next_action);
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

  const getContextTitle = () => {
    return context === 'project' ? '404 Code Lab Project AI' : '404 Code Lab Sales AI';
  };

  const getContextDescription = () => {
    return context === 'project' 
      ? 'I can help with project management, tasks, and progress tracking.'
      : 'I can generate quotes, explain services, and help with project planning.';
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center text-sm">
          <Brain className="h-4 w-4 mr-2" />
          {getContextTitle()}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{getContextDescription()}</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
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
                    <div className="text-xs opacity-75">Actions:</div>
                    {msg.tools.map((tool: any, toolIndex: number) => (
                      <Badge key={toolIndex} variant="secondary" className="text-xs mr-1">
                        {tool.success ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {tool.data?.ticket_id ? `Ticket #${tool.data.ticket_number}` : 
                         tool.data?.quote_id ? `Quote Created` :
                         tool.data?.project_id ? `Project Created` : 
                         'Complete'}
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
            placeholder={`Ask me about ${context === 'project' ? 'project management' : 'services and quotes'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="resize-none h-16 text-sm"
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
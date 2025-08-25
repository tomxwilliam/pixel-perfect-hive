import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  context: "project" | "contact";
  onSuggestion?: (suggestion: string) => void;
}

export function AIAssistant({ context, onSuggestion }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAIQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          query,
          context,
          type: context === "project" ? "project_help" : "contact_help"
        }
      });

      if (error) throw error;
      
      setResponse(data.response);
      
      if (onSuggestion && data.suggestion) {
        onSuggestion(data.suggestion);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "AI Assistant Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getContextTitle = () => {
    return context === "project" ? "Project Assistant" : "Contact Helper";
  };

  const getContextDescription = () => {
    return context === "project" 
      ? "Get help with project planning, requirements, or technical questions"
      : "Get assistance with your inquiry or learn about our services";
  };

  const getSampleQuestions = () => {
    if (context === "project") {
      return [
        "What should I consider for my e-commerce website?",
        "Help me define my mobile app requirements",
        "What features do I need for a multiplayer game?",
        "Estimate timeline for a booking system"
      ];
    } else {
      return [
        "What services do you offer?",
        "How much does web development cost?",
        "What's included in your maintenance packages?",
        "Do you provide hosting services?"
      ];
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
        size="sm"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{getContextTitle()}</CardTitle>
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
        <p className="text-xs text-muted-foreground">{getContextDescription()}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!response && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-1 text-accent" />
              Try asking:
            </p>
            <div className="space-y-1">
              {getSampleQuestions().map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-2 text-xs text-left justify-start hover:bg-primary/10"
                  onClick={() => setQuery(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">AI Response</Badge>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              {response}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResponse("");
                setQuery("");
              }}
              className="text-xs"
            >
              Ask another question
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="Ask me anything about your project or our services..."
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
                Thinking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
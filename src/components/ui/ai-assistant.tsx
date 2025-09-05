import { PortalAIChat } from "./portal-ai-chat";

interface AIAssistantProps {
  context: "project" | "contact";
  onSuggestion?: (suggestion: string) => void;
}

export function AIAssistant({ context, onSuggestion }: AIAssistantProps) {
  const aiContext = context === "project" ? "project" : "sales";

  return (
    <PortalAIChat 
      context={aiContext}
      onActionRequired={onSuggestion}
    />
  );
}
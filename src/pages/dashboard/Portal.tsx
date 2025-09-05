import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalAIChat } from "@/components/ui/portal-ai-chat";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { 
  Brain, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  Users, 
  Clock,
  CheckCircle,
  ArrowRight,
  Shield
} from "lucide-react";

export default function Portal() {
  const handleActionRequired = (action: string) => {
    console.log('Action required:', action);
    // Handle next actions from AI
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Seo 
        title="404 Code Lab Portal AI - Autonomous Operations Assistant"
        description="Comprehensive AI assistant for support, sales, billing, and project management at 404 Code Lab"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portal AI Dashboard</h1>
            <p className="text-muted-foreground">
              Your comprehensive operations assistant for 404 Code Lab services
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Active
          </Badge>
        </div>

        {/* AI Capabilities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Support Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Ticket creation, issue triage, and first-contact resolution
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Fully Automated
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Sales & Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Quote generation, invoicing, and payment link creation
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Active & Ready
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Project creation, task tracking, and progress monitoring
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Operational
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                Compliance & Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                UK/GDPR compliant with full audit trails
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                Always Active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  // This would trigger the AI chat with a preset message
                }}
              >
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    New Customer Inquiry
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Process and triage customer requests
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  // This would trigger the AI chat with a preset message
                }}
              >
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Generate Quote
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Create estimates for new projects
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  // This would trigger the AI chat with a preset message
                }}
              >
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    System Status
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Check operations and metrics
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardHeader>
            <CardTitle>System Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Autonomous Operations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    First-contact issue resolution
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Automated ticket-to-project workflow
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Intelligent customer triage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Quote generation and invoicing
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Compliance & Security</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    UK/EU GDPR compliant operations
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Complete audit trail logging
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Role-based access control
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Automatic escalation protocols
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Interface */}
      <PortalAIChat 
        context="general"
        onActionRequired={handleActionRequired}
      />
    </div>
  );
}
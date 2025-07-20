import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  FileText, 
  Share2,
  Settings,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';

interface AIAgentSettings {
  id: string;
  agent_name: string;
  is_enabled: boolean;
  scope_config: {
    quoting: boolean;
    faqs: boolean;
    admin_tasks: boolean;
  };
  module_permissions: {
    billing: boolean;
    quotes: boolean;
    messaging: boolean;
    calendar: boolean;
    socials: boolean;
  };
  vertex_config: any;
  created_at: string;
  updated_at: string;
}

interface AIAgentSettingsProps {
  isSuperAdmin: boolean;
}

const AIAgentSettingsComponent: React.FC<AIAgentSettingsProps> = ({ isSuperAdmin }) => {
  const [aiSettings, setAiSettings] = useState<AIAgentSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchAISettings();
  }, []);

  const fetchAISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setAiSettings(data as AIAgentSettings);
        // Check if Vertex AI is connected (you would implement actual connection check)
        setIsConnected(!!data.vertex_config && Object.keys(data.vertex_config as any).length > 0);
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI agent settings",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSettings = async (updates: Partial<AIAgentSettings>) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can configure AI agent settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (aiSettings) {
        const { error } = await supabase
          .from('ai_agent_settings')
          .update(updates)
          .eq('id', aiSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_agent_settings')
          .insert({
            agent_name: '404 Code Lab AI Assistant',
            is_enabled: false,
            ...updates
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "AI agent settings updated successfully",
      });

      fetchAISettings();
    } catch (error) {
      console.error('Error updating AI settings:', error);
      toast({
        title: "Error",
        description: "Failed to update AI agent settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectVertexAI = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can configure AI integrations",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement Google Vertex AI OAuth flow
    toast({
      title: "Vertex AI Connection",
      description: "Google Vertex AI OAuth flow would be initiated here",
    });
  };

  const moduleIcons = {
    billing: <DollarSign className="h-4 w-4" />,
    quotes: <FileText className="h-4 w-4" />,
    messaging: <MessageSquare className="h-4 w-4" />,
    calendar: <Calendar className="h-4 w-4" />,
    socials: <Share2 className="h-4 w-4" />
  };

  const moduleLabels = {
    billing: 'Billing & Invoices',
    quotes: 'Quote Generation',
    messaging: 'Customer Messaging',
    calendar: 'Calendar Management',
    socials: 'Social Media'
  };

  const scopeLabels = {
    quoting: 'Automated Quoting',
    faqs: 'FAQ Responses',
    admin_tasks: 'Admin Task Assistance'
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Super Admin Access Required</h3>
        <p className="text-muted-foreground">
          Only the super admin (tom@404codelab.com) can configure AI agent settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        <p>Configure Google Vertex AI Agent to automate tasks and assist with admin operations.</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Google Vertex AI Connection
            </div>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {isConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? 'Your Google Vertex AI account is connected and ready to assist.'
                  : 'Connect your Google Vertex AI account to enable AI-powered automation.'
                }
              </p>
            </div>
            <Button 
              onClick={handleConnectVertexAI}
              disabled={loading}
              variant={isConnected ? "outline" : "default"}
            >
              {isConnected ? 'Reconnect' : 'Connect Vertex AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agent_name">Agent Name</Label>
            <Input
              id="agent_name"
              value={aiSettings?.agent_name || '404 Code Lab AI Assistant'}
              onChange={(e) => handleUpdateSettings({ agent_name: e.target.value })}
              placeholder="AI Agent Name"
              disabled={!isConnected}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_enabled" className="text-base font-medium">
                Enable AI Agent
              </Label>
              <p className="text-sm text-muted-foreground">
                Activate the AI agent to start automation and assistance
              </p>
            </div>
            <Switch
              id="is_enabled"
              checked={aiSettings?.is_enabled || false}
              onCheckedChange={(checked) => handleUpdateSettings({ is_enabled: checked })}
              disabled={!isConnected}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scope Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Agent Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(scopeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {key === 'quoting' && 'Automatically generate quotes based on project requirements'}
                    {key === 'faqs' && 'Respond to frequently asked questions from customers'}
                    {key === 'admin_tasks' && 'Assist with administrative tasks and data management'}
                  </p>
                </div>
                <Switch
                  checked={aiSettings?.scope_config?.[key as keyof typeof aiSettings.scope_config] || false}
                  onCheckedChange={(checked) => 
                    handleUpdateSettings({
                      scope_config: {
                        ...aiSettings?.scope_config,
                        [key]: checked
                      }
                    })
                  }
                  disabled={!isConnected || !aiSettings?.is_enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Module Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(moduleLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {moduleIcons[key as keyof typeof moduleIcons]}
                  <div>
                    <Label className="text-base font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow AI control of {label.toLowerCase()}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={aiSettings?.module_permissions?.[key as keyof typeof aiSettings.module_permissions] || false}
                  onCheckedChange={(checked) => 
                    handleUpdateSettings({
                      module_permissions: {
                        ...aiSettings?.module_permissions,
                        [key]: checked
                      }
                    })
                  }
                  disabled={!isConnected || !aiSettings?.is_enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Intelligent Quoting
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Analyze project requirements</li>
                <li>• Generate accurate pricing</li>
                <li>• Suggest service packages</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Customer Support
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer common questions</li>
                <li>• Route complex inquiries</li>
                <li>• Provide project updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Admin Assistance
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Data entry automation</li>
                <li>• Report generation</li>
                <li>• Task prioritization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentSettingsComponent;
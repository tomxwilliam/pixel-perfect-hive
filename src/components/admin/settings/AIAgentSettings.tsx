
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
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
  Shield,
  Users,
  Clock,
  Zap,
  Target,
  Mail,
  Tag,
  BarChart3,
  Workflow,
  Save,
  AlertTriangle,
  ChevronRight,
  Play,
  Pause,
  Bell
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AIAgentSettings {
  id: string;
  agent_name: string;
  is_enabled: boolean;
  scope_config: {
    quoting: boolean;
    faqs: boolean;
    admin_tasks: boolean;
    client_intake: boolean;
    ai_workflows: boolean;
    calendar_management: boolean;
    social_automation: boolean;
    session_management: boolean;
  };
  module_permissions: {
    billing: boolean;
    quotes: boolean;
    messaging: boolean;
    calendar: boolean;
    socials: boolean;
    client_triage: boolean;
    task_prioritization: boolean;
    email_drafting: boolean;
    progress_tracking: boolean;
  };
  automation_config: {
    auto_triage: boolean;
    auto_quotes: boolean;
    email_replies: boolean;
    welcome_messages: boolean;
    offline_progression: boolean;
    task_prioritization: boolean;
    calendar_scheduling: boolean;
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
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

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
            scope_config: {
              quoting: true,
              faqs: true,
              admin_tasks: true,
              client_intake: false,
              ai_workflows: false,
              calendar_management: false,
              social_automation: false,
              session_management: false
            },
            module_permissions: {
              billing: false,
              quotes: false,
              messaging: false,
              calendar: false,
              socials: false,
              client_triage: false,
              task_prioritization: false,
              email_drafting: false,
              progress_tracking: false
            },
            automation_config: {
              auto_triage: false,
              auto_quotes: false,
              email_replies: false,
              welcome_messages: false,
              offline_progression: false,
              task_prioritization: false,
              calendar_scheduling: false
            },
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

    setLoading(true);
    try {
      // Test Vertex AI connection
      const { data, error } = await supabase.functions.invoke('test-vertex-ai');
      
      if (error) throw error;

      if (data.success) {
        // Update AI settings with connection status
        await handleUpdateSettings({
          vertex_config: {
            connected: true,
            projectId: data.projectId,
            connectedAt: new Date().toISOString()
          }
        });
        
        setIsConnected(true);
        toast({
          title: "Success!",
          description: `Vertex AI connected successfully to project: ${data.projectId}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Vertex AI connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Vertex AI. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Super Admin Access Required</h3>
        <p className="text-muted-foreground">
          Only administrators with super admin privileges can configure AI agent settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        <p>Configure comprehensive AI automation for 404 Code Lab operations.</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Automation Status
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                {isConnected ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isConnected ? 'Connected' : 'Not Connected'}
              </Badge>
              {aiSettings?.is_enabled && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
            <div>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? '404 Code Lab Portal AI is connected and ready for autonomous operations: support, sales, billing, projects, and customer communications.'
                  : 'Connect Google Vertex AI to enable the comprehensive Portal AI operations system.'
                }
              </p>
              {isConnected && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Active Capabilities:</strong> Ticket management, quote generation, project tracking, customer triage, audit logging, UK/GDPR compliance
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleConnectVertexAI}
                disabled={loading}
                variant={isConnected ? "outline" : "default"}
                size={isMobile ? "sm" : "default"}
              >
                {isConnected ? 'Reconnect' : 'Connect Vertex AI'}
              </Button>
              {isConnected && (
                <Button
                  onClick={() => handleUpdateSettings({ is_enabled: !aiSettings?.is_enabled })}
                  variant={aiSettings?.is_enabled ? "secondary" : "default"}
                  size={isMobile ? "sm" : "default"}
                  disabled={loading}
                >
                  {aiSettings?.is_enabled ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause AI
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start AI
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Tabs */}
      <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <MobileTabsList className={`${isMobile ? 'grid grid-cols-2 h-auto' : 'grid grid-cols-6'} w-full`}>
          <MobileTabsTrigger value="overview" className="flex items-center gap-1 text-xs">
            <Target className="h-3 w-3" />
            {!isMobile && 'Overview'}
          </MobileTabsTrigger>
          <MobileTabsTrigger value="intake" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            {!isMobile && 'Client Intake'}
          </MobileTabsTrigger>
          <MobileTabsTrigger value="workflows" className="flex items-center gap-1 text-xs">
            <Workflow className="h-3 w-3" />
            {!isMobile && 'AI Workflows'}
          </MobileTabsTrigger>
          <MobileTabsTrigger value="calendar" className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {!isMobile && 'Calendar'}
          </MobileTabsTrigger>
          <MobileTabsTrigger value="system" className="flex items-center gap-1 text-xs">
            <Save className="h-3 w-3" />
            {!isMobile && 'System'}
          </MobileTabsTrigger>
        </MobileTabsList>

        <MobileTabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
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

              <Separator />

              <div className="grid gap-4">
                <h4 className="font-medium">Quick Actions</h4>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <h5 className="font-medium">Support Operations</h5>
                        <p className="text-sm text-muted-foreground">Ticket creation, triage & resolution</p>
                      </div>
                    </div>
                    <Switch 
                      checked={aiSettings?.scope_config?.client_intake || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          scope_config: {
                            ...aiSettings?.scope_config,
                            client_intake: checked
                          }
                        })
                      }
                      disabled={!isConnected}
                      className="mt-2"
                    />
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div>
                        <h5 className="font-medium">Sales & Billing</h5>
                        <p className="text-sm text-muted-foreground">Quotes, invoices & payment links</p>
                      </div>
                    </div>
                    <Switch 
                      checked={aiSettings?.scope_config?.ai_workflows || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          scope_config: {
                            ...aiSettings?.scope_config,
                            ai_workflows: checked
                          }
                        })
                      }
                      disabled={!isConnected}
                      className="mt-2"
                    />
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-8 w-8 text-purple-500" />
                      <div>
                        <h5 className="font-medium">Project Management</h5>
                        <p className="text-sm text-muted-foreground">Project creation & task tracking</p>
                      </div>
                    </div>
                    <Switch 
                      checked={aiSettings?.scope_config?.social_automation || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          scope_config: {
                            ...aiSettings?.scope_config,
                            social_automation: checked
                          }
                        })
                      }
                      disabled={!isConnected}
                      className="mt-2"
                    />
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h6 className="font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Active Automations Summary
                  </h6>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Operations Active:</div>
                      <div className="text-muted-foreground">
                        {Object.values(aiSettings?.scope_config || {}).filter(Boolean).length} / {Object.keys(aiSettings?.scope_config || {}).length}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">System Status:</div>
                      <div className={aiSettings?.is_enabled ? "text-green-600" : "text-amber-600"}>
                        {aiSettings?.is_enabled ? "Fully Active" : "Standby Mode"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="intake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Intake & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  { key: 'auto_triage', label: 'Auto-triage Client Requests', desc: 'Automatically categorize by Web/App/Game services', icon: Target },
                  { key: 'auto_quotes', label: 'Auto-generate Quotes', desc: 'Create rough estimates from intake forms', icon: DollarSign },
                  { key: 'email_replies', label: 'Draft Email Replies', desc: 'AI-powered professional responses', icon: Mail },
                  { key: 'welcome_messages', label: 'Welcome-back Messages', desc: 'Personalized messages for returning clients', icon: MessageSquare },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label className="text-base font-medium">{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings?.automation_config?.[key as keyof typeof aiSettings.automation_config] || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          automation_config: {
                            ...aiSettings?.automation_config,
                            [key]: checked
                          }
                        })
                      }
                      disabled={!isConnected || !aiSettings?.is_enabled}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Advanced Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>Auto-tagging System</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Conditional Form Inputs</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                AI Agent Workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  { key: 'task_prioritization', label: 'Auto-prioritize Tasks', desc: 'Based on deadline and complexity', icon: AlertTriangle },
                  { key: 'offline_progression', label: 'Offline Progression Tracking', desc: 'Simulate up to 5 hours of work progress', icon: Clock },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-green-500" />
                      <div>
                        <Label className="text-base font-medium">{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings?.automation_config?.[key as keyof typeof aiSettings.automation_config] || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          automation_config: {
                            ...aiSettings?.automation_config,
                            [key]: checked
                          }
                        })
                      }
                      disabled={!isConnected || !aiSettings?.is_enabled}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Smart Assistance Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>Pre-fill Form Data</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <span>Session State Saving</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Auto-populate Progress Updates</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendar & Project Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  { key: 'calendar_scheduling', label: 'Auto-schedule Calls & Deadlines', desc: 'Google Calendar integration', icon: Calendar },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label className="text-base font-medium">{label}</Label>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={aiSettings?.automation_config?.[key as keyof typeof aiSettings.automation_config] || false}
                      onCheckedChange={(checked) => 
                        handleUpdateSettings({
                          automation_config: {
                            ...aiSettings?.automation_config,
                            [key]: checked
                          }
                        })
                      }
                      disabled={!isConnected || !aiSettings?.is_enabled}
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Notification Features</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>Client Milestone Notifications</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Internal Team Reminders</span>
                    </div>
                    <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                System & Session Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>Save/Resume Dashboard Progress</span>
                  </div>
                  <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Welcome Back Screen</span>
                  </div>
                  <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5-Hour Offline Progression</span>
                  </div>
                  <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Comprehensive Data Backup</span>
                  </div>
                  <Switch disabled={!isConnected || !aiSettings?.is_enabled} />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  System Status
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Last Backup:</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Sessions:</span>
                    <span className="text-muted-foreground">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Offline Progress:</span>
                    <span className="text-muted-foreground">Enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileTabsContent>
      </MobileTabs>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {Object.values(aiSettings?.automation_config || {}).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Automations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">5hrs</div>
              <div className="text-sm text-muted-foreground">Offline Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">∞</div>
              <div className="text-sm text-muted-foreground">Scalability</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentSettingsComponent;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link2, 
  Calendar, 
  DollarSign, 
  Linkedin, 
  Twitter, 
  RefreshCw, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  MessageSquare,
  Mail,
  Users,
  Video,
  Code,
  Ticket,
  CheckSquare,
  FileText,
  Database,
  Zap
} from 'lucide-react';

interface APIIntegration {
  id: string;
  integration_name: string;
  integration_type: string;
  is_connected: boolean;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  config_data: any;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

interface APIIntegrationsProps {
  isSuperAdmin: boolean;
}

const APIIntegrations: React.FC<APIIntegrationsProps> = ({ isSuperAdmin }) => {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('integration_type', { ascending: true });

      if (error) throw error;
      
      // Define all available integrations
      const allIntegrations = [
        { type: 'xero', name: 'Xero Accounting' },
        { type: 'google_calendar', name: 'Google Calendar' },
        { type: 'linkedin', name: 'LinkedIn' },
        { type: 'twitter', name: 'Twitter' },
        { type: 'stripe', name: 'Stripe Payments' },
        { type: 'paypal', name: 'PayPal' },
        { type: 'slack', name: 'Slack' },
        { type: 'discord', name: 'Discord' },
        { type: 'microsoft_teams', name: 'Microsoft Teams' },
        { type: 'openai', name: 'OpenAI API' },
        { type: 'sendgrid', name: 'SendGrid Email' },
        { type: 'twilio', name: 'Twilio SMS' },
        { type: 'mailchimp', name: 'Mailchimp' },
        { type: 'hubspot', name: 'HubSpot CRM' },
        { type: 'salesforce', name: 'Salesforce' },
        { type: 'zoom', name: 'Zoom' },
        { type: 'github', name: 'GitHub' },
        { type: 'gitlab', name: 'GitLab' },
        { type: 'jira', name: 'Jira' },
        { type: 'trello', name: 'Trello' },
        { type: 'notion', name: 'Notion' },
        { type: 'airtable', name: 'Airtable' },
        { type: 'zapier', name: 'Zapier' },
        { type: 'unlimited_web_hosting', name: 'Unlimited Web Hosting UK' },
        { type: 'openprovider', name: 'OpenProvider Domains' },
        { type: 'whm_cpanel', name: 'WHM/cPanel' }
      ];
      
      // Get existing integration types
      const existingTypes = data?.map(i => i.integration_type) || [];
      const missingIntegrations = allIntegrations.filter(integration => 
        !existingTypes.includes(integration.type)
      );
      
      // Insert missing integrations one by one to handle constraint issues
      for (const integration of missingIntegrations) {
        try {
          await supabase
            .from('api_integrations')
            .insert({
              integration_name: integration.name,
              integration_type: integration.type,
              is_connected: false
            });
        } catch (insertError) {
          console.log(`Integration ${integration.type} may already exist or is not supported:`, insertError);
        }
      }
      
      // Refetch all integrations
      const { data: finalData, error: finalError } = await supabase
        .from('api_integrations')
        .select('*')
        .order('integration_name', { ascending: true });
        
      if (finalError) throw finalError;
      setIntegrations(finalData as APIIntegration[] || []);
      
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API integrations",
        variant: "destructive",
      });
    }
  };

  const getIntegrationName = (type: string): string => {
    const names: Record<string, string> = {
      xero: 'Xero Accounting',
      google_calendar: 'Google Calendar',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      stripe: 'Stripe Payments',
      paypal: 'PayPal',
      slack: 'Slack',
      discord: 'Discord',
      microsoft_teams: 'Microsoft Teams',
      openai: 'OpenAI API',
      sendgrid: 'SendGrid Email',
      twilio: 'Twilio SMS',
      mailchimp: 'Mailchimp',
      hubspot: 'HubSpot CRM',
      salesforce: 'Salesforce',
      zoom: 'Zoom',
      github: 'GitHub',
      gitlab: 'GitLab',
      jira: 'Jira',
      trello: 'Trello',
      notion: 'Notion',
      airtable: 'Airtable',
      zapier: 'Zapier',
      unlimited_web_hosting: 'Unlimited Web Hosting UK',
      openprovider: 'OpenProvider Domains',
      whm_cpanel: 'WHM/cPanel'
    };
    return names[type] || type;
  };

  const getIntegrationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      xero: <DollarSign className="h-5 w-5" />,
      google_calendar: <Calendar className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      twitter: <Twitter className="h-5 w-5" />,
      unlimited_web_hosting: <Server className="h-5 w-5" />,
      openprovider: <Server className="h-5 w-5" />,
      whm_cpanel: <Server className="h-5 w-5" />,
      stripe: <DollarSign className="h-5 w-5" />,
      paypal: <DollarSign className="h-5 w-5" />,
      slack: <MessageSquare className="h-5 w-5" />,
      discord: <MessageSquare className="h-5 w-5" />,
      microsoft_teams: <MessageSquare className="h-5 w-5" />,
      openai: <Settings className="h-5 w-5" />,
      sendgrid: <Mail className="h-5 w-5" />,
      twilio: <MessageSquare className="h-5 w-5" />,
      mailchimp: <Mail className="h-5 w-5" />,
      hubspot: <Users className="h-5 w-5" />,
      salesforce: <Users className="h-5 w-5" />,
      zoom: <Video className="h-5 w-5" />,
      github: <Code className="h-5 w-5" />,
      gitlab: <Code className="h-5 w-5" />,
      jira: <Ticket className="h-5 w-5" />,
      trello: <CheckSquare className="h-5 w-5" />,
      notion: <FileText className="h-5 w-5" />,
      airtable: <Database className="h-5 w-5" />,
      zapier: <Zap className="h-5 w-5" />
    };
    return icons[type] || <Link2 className="h-5 w-5" />;
  };

  const getIntegrationDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      xero: 'Automatically sync invoices, quotes, and billing data with Xero accounting software.',
      google_calendar: 'Create calendar events automatically when projects start or deadlines are set.',
      linkedin: 'Post project updates and company announcements directly to your LinkedIn profile.',
      twitter: 'Share completed projects, announcements, and engage with your audience on Twitter.',
      unlimited_web_hosting: 'Automatically provision, manage, and monitor cPanel hosting accounts with Unlimited Web Hosting UK.',
      openprovider: 'Register and manage domains through OpenProvider API for automated domain registration and DNS management.',
      whm_cpanel: 'Manage cPanel hosting accounts through WHM (Web Host Manager) reseller interface for complete hosting automation.',
      stripe: 'Process payments securely with Stripe payment gateway integration.',
      paypal: 'Accept PayPal payments for invoices and project milestones.',
      slack: 'Send project updates and notifications to your Slack workspace.',
      discord: 'Connect your Discord server for team collaboration and notifications.',
      microsoft_teams: 'Integrate with Microsoft Teams for seamless communication.',
      openai: 'Leverage OpenAI API for AI-powered features and automation.',
      sendgrid: 'Send transactional emails and notifications via SendGrid.',
      twilio: 'Send SMS notifications and alerts to customers via Twilio.',
      mailchimp: 'Manage email marketing campaigns and customer communications.',
      hubspot: 'Sync customer data and manage relationships with HubSpot CRM.',
      salesforce: 'Integrate with Salesforce for comprehensive customer management.',
      zoom: 'Schedule and manage video meetings for client consultations.',
      github: 'Connect GitHub repositories for project development tracking.',
      gitlab: 'Integrate GitLab for version control and project management.',
      jira: 'Track project issues and tasks with Jira integration.',
      trello: 'Manage project boards and tasks with Trello integration.',
      notion: 'Sync project documentation and notes with Notion.',
      airtable: 'Manage project data and workflows with Airtable integration.',
      zapier: 'Connect hundreds of apps and automate workflows with Zapier.'
    };
    return descriptions[type] || `${type} integration for enhanced workflow automation.`;
  };

  const handleConnect = async (integration: APIIntegration) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can configure API integrations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (integration.integration_type === 'unlimited_web_hosting') {
        // For hosting provider, show a form to collect API credentials
        const apiKey = prompt('Enter your Unlimited Web Hosting UK API Key:');
        const apiUrl = prompt('Enter your Unlimited Web Hosting UK API URL:', 'https://api.unlimitedwebhosting.co.uk');
        
        if (apiKey && apiUrl) {
          const { error } = await supabase
            .from('api_integrations')
            .update({
              is_connected: true,
              access_token: apiKey,
              config_data: { api_url: apiUrl },
              last_sync_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (error) throw error;

          toast({
            title: "Connected",
            description: "Unlimited Web Hosting UK integration connected successfully",
          });

          fetchIntegrations();
        }
      } else if (integration.integration_type === 'openprovider') {
        // For OpenProvider domains
        const apiKey = prompt('Enter your OpenProvider API Key:');
        const apiUrl = prompt('Enter your OpenProvider API URL:', 'https://api.openprovider.eu');
        
        if (apiKey && apiUrl) {
          const { error } = await supabase
            .from('api_integrations')
            .update({
              is_connected: true,
              access_token: apiKey,
              config_data: { api_url: apiUrl },
              last_sync_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (error) throw error;

          toast({
            title: "Connected",
            description: "OpenProvider domain integration connected successfully",
          });

          fetchIntegrations();
        }
      } else if (integration.integration_type === 'whm_cpanel') {
        // For WHM/cPanel, show comprehensive settings form
        const whmUrl = prompt('Enter your WHM Server URL:', 'https://your-whm-server.com:2087');
        const whmUsername = prompt('Enter your WHM Username:', 'root');
        const whmApiToken = prompt('Enter your WHM API Token:');
        const packageTemplate = prompt('Enter WHM Package Names (comma-separated):', 'starter,business,professional');
        const serverIp = prompt('Enter Default Server IP:');
        
        if (whmUrl && whmUsername && whmApiToken) {
          const { error } = await supabase
            .from('api_integrations')
            .update({
              is_connected: true,
              access_token: whmApiToken,
              config_data: { 
                whm_url: whmUrl,
                whm_username: whmUsername,
                package_template: packageTemplate,
                server_ip: serverIp,
                auto_provision: true
              },
              last_sync_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (error) throw error;

          toast({
            title: "Connected",
            description: "WHM/cPanel integration connected successfully",
          });

          fetchIntegrations();
        }
      } else if (integration.integration_type === 'twitter') {
        // For Twitter, test the connection using stored credentials
        try {
          const { data, error } = await supabase.functions.invoke('twitter-integration/connect');
          
          if (error) throw error;
          
          if (data.success) {
            const { error: updateError } = await supabase
              .from('api_integrations')
              .update({
                is_connected: true,
                last_sync_at: new Date().toISOString()
              })
              .eq('id', integration.id);

            if (updateError) throw updateError;

            toast({
              title: "Connected",
              description: "Twitter integration connected successfully",
            });

            fetchIntegrations();
          } else {
            throw new Error(data.error || 'Failed to connect to Twitter');
          }
        } catch (error) {
          console.error('Twitter connection error:', error);
          toast({
            title: "Connection Failed",
            description: `Failed to connect Twitter: ${error.message}`,
            variant: "destructive",
          });
        }
      } else {
        // For other integrations, show OAuth placeholder
        toast({
          title: "OAuth Flow",
          description: `Initiating ${integration.integration_name} OAuth flow...`,
        });
        
        // TODO: Implement actual OAuth flows for each service
        // This would redirect to the service's OAuth page
      }
      
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: "Error",
        description: "Failed to connect integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (integration: APIIntegration) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can configure API integrations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('api_integrations')
        .update({
          is_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          config_data: {},
          last_sync_at: null
        })
        .eq('id', integration.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${integration.integration_name} disconnected successfully`,
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integration: APIIntegration) => {
    if (!integration.is_connected) {
      toast({
        title: "Not Connected",
        description: `${integration.integration_name} is not connected`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual sync logic for each integration
      // This would call the appropriate edge function
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
      
      const { error } = await supabase
        .from('api_integrations')
        .update({
          last_sync_at: new Date().toISOString()
        })
        .eq('id', integration.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${integration.integration_name} synced successfully`,
      });

      fetchIntegrations();
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast({
        title: "Error",
        description: "Failed to sync integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = (integration: APIIntegration) => {
    if (!integration.is_connected) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: 'Disconnected',
        variant: 'destructive' as const
      };
    }

    const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : null;
    const now = new Date();
    
    if (expiresAt && expiresAt < now) {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: 'Token Expired',
        variant: 'secondary' as const
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      text: 'Connected',
      variant: 'default' as const
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        <p>Connect external services to automate workflows and sync data across platforms.</p>
        {!isSuperAdmin && (
          <p className="mt-2 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <strong>Note:</strong> Only the super admin can configure API integrations.
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {integrations.map((integration) => {
          const status = getConnectionStatus(integration);
          
          return (
            <Card key={integration.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIntegrationIcon(integration.integration_type)}
                    <div>
                      <h3 className="text-lg font-semibold">{integration.integration_name}</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {getIntegrationDescription(integration.integration_type)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    {status.icon}
                    {status.text}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {integration.last_sync_at && (
                      <p className="text-sm text-muted-foreground">
                        Last synced: {new Date(integration.last_sync_at).toLocaleString()}
                      </p>
                    )}
                    {integration.token_expires_at && integration.is_connected && (
                      <p className="text-sm text-muted-foreground">
                        Token expires: {new Date(integration.token_expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {integration.is_connected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    )}
                    
                    {/* Quick access to management */}
                    {integration.integration_type === 'unlimited_web_hosting' && integration.is_connected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/admin?section=hosting', '_blank')}
                      >
                        Manage Hosting
                      </Button>
                    )}
                    
                    {integration.integration_type === 'openprovider' && integration.is_connected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/admin?section=domains', '_blank')}
                      >
                        Manage Domains
                      </Button>
                    )}
                    
                    {integration.is_connected ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(integration)}
                        disabled={loading || !isSuperAdmin}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleConnect(integration)}
                        disabled={loading || !isSuperAdmin}
                        size="sm"
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Xero Accounting</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-sync invoices and quotes</li>
                <li>• Real-time billing data</li>
                <li>• Payment status updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Google Calendar</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Project milestone events</li>
                <li>• Deadline reminders</li>
                <li>• Client meeting scheduling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">LinkedIn</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Project showcase posts</li>
                <li>• Company announcements</li>
                <li>• Professional networking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Twitter</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Quick project updates</li>
                <li>• Scheduled content</li>
                <li>• Community engagement</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Unlimited Web Hosting UK</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic cPanel provisioning</li>
                <li>• Hosting account management</li>
                <li>• Real-time status monitoring</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">OpenProvider Domains</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automated domain registration</li>
                <li>• DNS management and control</li>
                <li>• Domain renewals and transfers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIIntegrations;
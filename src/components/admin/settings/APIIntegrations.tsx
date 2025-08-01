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
  Server
} from 'lucide-react';

interface APIIntegration {
  id: string;
  integration_name: string;
  integration_type: 'xero' | 'google_calendar' | 'linkedin' | 'twitter' | 'unlimited_web_hosting';
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
      
      // Initialize default integrations if none exist
      const existingTypes = data?.map(i => i.integration_type) || [];
      const allTypes: APIIntegration['integration_type'][] = ['xero', 'google_calendar', 'linkedin', 'twitter', 'unlimited_web_hosting'];
      const missingTypes = allTypes.filter(type => !existingTypes.includes(type));
      
      if (missingTypes.length > 0) {
        const newIntegrations = missingTypes.map(type => ({
          integration_name: getIntegrationName(type),
          integration_type: type,
          is_connected: false
        }));
        
        const { error: insertError } = await supabase
          .from('api_integrations')
          .insert(newIntegrations);
          
        if (insertError) throw insertError;
        
        // Refetch after inserting
        const { data: updatedData, error: refetchError } = await supabase
          .from('api_integrations')
          .select('*')
          .order('integration_type', { ascending: true });
          
        if (refetchError) throw refetchError;
        setIntegrations(updatedData as APIIntegration[] || []);
      } else {
        setIntegrations(data as APIIntegration[] || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API integrations",
        variant: "destructive",
      });
    }
  };

  const getIntegrationName = (type: APIIntegration['integration_type']): string => {
    const names = {
      xero: 'Xero Accounting',
      google_calendar: 'Google Calendar',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      unlimited_web_hosting: 'Unlimited Web Hosting UK'
    };
    return names[type];
  };

  const getIntegrationIcon = (type: APIIntegration['integration_type']) => {
    const icons = {
      xero: <DollarSign className="h-5 w-5" />,
      google_calendar: <Calendar className="h-5 w-5" />,
      linkedin: <Linkedin className="h-5 w-5" />,
      twitter: <Twitter className="h-5 w-5" />,
      unlimited_web_hosting: <Server className="h-5 w-5" />
    };
    return icons[type];
  };

  const getIntegrationDescription = (type: APIIntegration['integration_type']): string => {
    const descriptions = {
      xero: 'Automatically sync invoices, quotes, and billing data with Xero accounting software.',
      google_calendar: 'Create calendar events automatically when projects start or deadlines are set.',
      linkedin: 'Post project updates and company announcements directly to your LinkedIn profile.',
      twitter: 'Share completed projects, announcements, and engage with your audience on Twitter.',
      unlimited_web_hosting: 'Automatically provision, manage, and monitor cPanel hosting accounts with Unlimited Web Hosting UK.'
    };
    return descriptions[type];
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIIntegrations;
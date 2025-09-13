import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link2, 
  RefreshCw, 
  Settings,
  CheckCircle,
  XCircle,
  Server,
  AlertTriangle
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
        .in('integration_type', ['unlimited_web_hosting', 'openprovider', 'whm_cpanel', 'google_ai'])
        .order('integration_name', { ascending: true });

      if (error) throw error;
      setIntegrations(data as APIIntegration[] || []);
      
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
      unlimited_web_hosting: 'Unlimited Web Hosting UK',
      openprovider: 'OpenProvider Domains',
      whm_cpanel: 'WHM/cPanel',
      google_ai: 'Google AI Agent'
    };
    return names[type] || type;
  };

  const getIntegrationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      unlimited_web_hosting: <Server className="h-5 w-5" />,
      openprovider: <Server className="h-5 w-5" />,
      whm_cpanel: <Server className="h-5 w-5" />,
      google_ai: <Settings className="h-5 w-5" />
    };
    return icons[type] || <Link2 className="h-5 w-5" />;
  };

  const getIntegrationDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      unlimited_web_hosting: 'Automatically provision, manage, and monitor cPanel hosting accounts with Unlimited Web Hosting UK.',
      openprovider: 'Register and manage domains through OpenProvider API for automated domain registration and DNS management.',
      whm_cpanel: 'Manage cPanel hosting accounts through WHM (Web Host Manager) reseller interface for complete hosting automation.',
      google_ai: 'Leverage Google AI (Gemini) for intelligent customer support, content generation, and automated assistance.'
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
      } else if (integration.integration_type === 'google_ai') {
        // For Google AI, just mark as connected if user confirms
        const confirmed = confirm('This will enable Google AI integration using your configured credentials. Continue?');
        if (confirmed) {
          const { error } = await supabase
            .from('api_integrations')
            .update({
              is_connected: true,
              last_sync_at: new Date().toISOString()
            })
            .eq('id', integration.id);

          if (error) throw error;

          toast({
            title: "Connected",
            description: "Google AI integration connected successfully",
          });

          fetchIntegrations();
        }
      } else {
        // For other integrations, show placeholder
        toast({
          title: "Integration",
          description: `${integration.integration_name} integration settings...`,
        });
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
        description: "Only super admin can modify integrations",
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
          config_data: null,
          last_sync_at: null
        })
        .eq('id', integration.id);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: `${integration.integration_name} has been disconnected`,
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only essential integrations are available: Web Hosting, Domain Management, and AI Assistant.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIntegrationIcon(integration.integration_type)}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {getIntegrationName(integration.integration_type)}
                    </h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {getIntegrationDescription(integration.integration_type)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={integration.is_connected ? "default" : "secondary"}>
                    {integration.is_connected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {integration.last_sync_at ? (
                    <span>Last synced: {new Date(integration.last_sync_at).toLocaleString()}</span>
                  ) : (
                    <span>Never synced</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {integration.is_connected ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration)}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConnect(integration)}
                      disabled={loading || !isSuperAdmin}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Show configuration details if connected */}
              {integration.is_connected && integration.config_data && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Configuration:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {integration.integration_type === 'whm_cpanel' && (
                      <>
                        <div>Server: {integration.config_data.whm_url}</div>
                        <div>Username: {integration.config_data.whm_username}</div>
                        <div>Auto-provision: {integration.config_data.auto_provision ? 'Enabled' : 'Disabled'}</div>
                      </>
                    )}
                    {integration.integration_type === 'openprovider' && (
                      <div>API URL: {integration.config_data.api_url}</div>
                    )}
                    {integration.integration_type === 'unlimited_web_hosting' && (
                      <div>API URL: {integration.config_data.api_url}</div>
                    )}
                  </div>
                </div>
              )}

              {!isSuperAdmin && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Only super administrators can modify API integrations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No integrations configured yet</p>
          <p className="text-sm">Contact system administrator to set up integrations</p>
        </div>
      )}
    </div>
  );
};

export default APIIntegrations;
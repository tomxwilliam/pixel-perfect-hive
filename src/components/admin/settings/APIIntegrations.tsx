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
  AlertTriangle,
  Globe,
  Bot,
  Zap,
  Power,
  PowerOff
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
        .eq('integration_type', 'google_ai')
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
      google_ai: 'Google AI Agent'
    };
    return names[type] || type;
  };

  const getIntegrationIcon = (type: string, isConnected: boolean) => {
    const iconClass = `h-6 w-6 ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`;
    const icons: Record<string, React.ReactNode> = {
      google_ai: <Bot className={iconClass} />
    };
    return icons[type] || <Link2 className={iconClass} />;
  };

  const getIntegrationDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
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
      if (integration.integration_type === 'google_ai') {
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
          Only Google AI integration is available for automated assistance and intelligent customer support.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIntegrationIcon(integration.integration_type, integration.is_connected)}
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
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    integration.is_connected 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {integration.is_connected ? (
                      <>
                        <Power className="h-3 w-3" />
                        <span className="text-sm font-medium">Connected</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-3 w-3" />
                        <span className="text-sm font-medium">Disconnected</span>
                      </>
                    )}
                  </div>
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
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <PowerOff className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-600 cursor-default"
                        disabled
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Active
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={isSuperAdmin ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleConnect(integration)}
                      disabled={loading || !isSuperAdmin}
                      className={isSuperAdmin ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

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
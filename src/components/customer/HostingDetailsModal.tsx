import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/integrations/supabase/types';
import { Server, Calendar, DollarSign, Globe, ExternalLink, Key, Shield, Database, HardDrive, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type HostingSubscription = Tables<'hosting_subscriptions'> & {
  hosting_packages: Tables<'hosting_packages'>;
  domains?: { domain_name: string } | null;
};

interface HostingDetailsModalProps {
  subscription: HostingSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HostingDetailsModal: React.FC<HostingDetailsModalProps> = ({
  subscription,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  
  if (!subscription) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleCPanelAccess = () => {
    if (subscription.server_ip && subscription.cpanel_username) {
      // Construct cPanel URL (assuming standard cPanel port 2083)
      const cpanelUrl = `https://${subscription.server_ip}:2083`;
      window.open(cpanelUrl, '_blank');
    }
  };

  const handlePasswordReset = async () => {
    setIsRequestingReset(true);
    try {
      // @ts-ignore - Function exists but types not yet regenerated
      const { error } = await supabase.rpc('request_hosting_password_reset', {
        account_id: subscription.id
      });

      if (error) throw error;

      toast({
        title: "Password Reset Requested",
        description: "Our team has been notified and will reset your cPanel password shortly. You'll receive an email with the new credentials.",
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Hosting Account Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your hosting subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hosting Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {subscription.hosting_packages.package_name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(subscription.status)}>
                      {subscription.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Account ID: #{subscription.id.split('-')[0]}
                    </span>
                  </div>
                  {subscription.domains?.domain_name && (
                    <div className="mt-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{subscription.domains.domain_name}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    £{Number(subscription.hosting_packages.monthly_price).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {subscription.billing_cycle}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Features */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Package Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">{subscription.hosting_packages.disk_space_gb} GB</div>
                  <div className="text-sm text-muted-foreground">SSD Storage</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">{subscription.hosting_packages.databases || 'Unlimited'}</div>
                  <div className="text-sm text-muted-foreground">Databases</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="font-medium">{subscription.hosting_packages.email_accounts || 'Unlimited'}</div>
                  <div className="text-sm text-muted-foreground">Email Accounts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="font-medium">{subscription.hosting_packages.subdomains || 'Unlimited'}</div>
                  <div className="text-sm text-muted-foreground">Subdomains</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Access Information */}
          {(subscription.cpanel_username || subscription.server_ip) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Account Access
                </h3>
                <div className="space-y-4">
                  {subscription.server_ip && (
                    <div>
                      <label className="text-sm font-medium">Server IP:</label>
                      <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm mt-1">
                        {subscription.server_ip}
                      </div>
                    </div>
                  )}
                  {subscription.cpanel_username && (
                    <div>
                      <label className="text-sm font-medium">cPanel Username:</label>
                      <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm mt-1">
                        {subscription.cpanel_username}
                      </div>
                    </div>
                  )}
                  
                  {/* Security Notice */}
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      <Shield className="h-3 w-3 inline mr-1" />
                      For security, passwords are never displayed. If you need to reset your cPanel password, use the button below.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {subscription.cpanel_username && subscription.server_ip && (
                      <Button onClick={handleCPanelAccess} className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Access cPanel
                      </Button>
                    )}
                    <Button 
                      onClick={handlePasswordReset} 
                      variant="outline"
                      disabled={isRequestingReset}
                      className="w-full"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRequestingReset ? 'animate-spin' : ''}`} />
                      {isRequestingReset ? 'Requesting...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Billing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(subscription.created_at)}
                  </div>
                </div>
                
                {subscription.provisioned_at && (
                  <div className="text-center p-4 border rounded-lg">
                    <Server className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">Provisioned</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(subscription.provisioned_at)}
                    </div>
                  </div>
                )}

                {subscription.next_billing_date && (
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="font-medium">Next Billing</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(subscription.next_billing_date)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          {subscription.hosting_packages.features && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Additional Features</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(subscription.hosting_packages.features, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Provider Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscription.hosting_provider_account_id && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Provider Account</h3>
                  <div className="text-sm">
                    <span className="font-medium">Provider ID:</span> {subscription.hosting_provider_account_id}
                  </div>
                </CardContent>
              </Card>
            )}

            {subscription.notes && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Support Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Support Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Need Help?</p>
                  <p className="text-blue-700">
                    For technical support with your hosting account, please contact our support team or create a support ticket.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
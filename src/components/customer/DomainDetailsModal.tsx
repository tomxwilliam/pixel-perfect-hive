import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tables } from '@/integrations/supabase/types';
import { Globe, Calendar, DollarSign, Server, Settings, Info } from 'lucide-react';

type Domain = Tables<'domains'>;

interface DomainDetailsModalProps {
  domain: Domain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DomainDetailsModal: React.FC<DomainDetailsModalProps> = ({
  domain,
  open,
  onOpenChange,
}) => {
  if (!domain) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'expired': return 'destructive';
      case 'suspended': return 'outline';
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

  const isExpired = domain.expiry_date && new Date(domain.expiry_date) < new Date();
  const daysUntilExpiry = domain.expiry_date 
    ? Math.ceil((new Date(domain.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your domain registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Domain Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {domain.domain_name}.{domain.tld}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(domain.status)}>
                      {domain.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Domain ID: #{domain.id.split('-')[0]}
                    </span>
                  </div>
                  {isExpired && (
                    <div className="mt-2">
                      <Badge variant="destructive">
                        EXPIRED
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary flex items-center">
                    <DollarSign className="h-5 w-5 mr-1" />
                    £{Number(domain.price).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">per year</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Status & Dates */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Registration Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Registration Date</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(domain.registration_date)}
                  </div>
                </div>
                
                <div className={`text-center p-4 border rounded-lg ${isExpired ? 'border-red-200 bg-red-50' : daysUntilExpiry && daysUntilExpiry <= 30 ? 'border-orange-200 bg-orange-50' : ''}`}>
                  <Calendar className={`h-8 w-8 mx-auto mb-2 ${isExpired ? 'text-red-500' : daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-orange-500' : 'text-green-500'}`} />
                  <div className="font-medium">Expiry Date</div>
                  <div className={`text-sm ${isExpired ? 'text-red-600' : daysUntilExpiry && daysUntilExpiry <= 30 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    {formatDate(domain.expiry_date)}
                    {daysUntilExpiry !== null && !isExpired && (
                      <div className="font-medium mt-1">
                        {daysUntilExpiry <= 30 ? `${daysUntilExpiry} days remaining` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Settings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Domain Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Auto Renewal</span>
                  <Badge variant={domain.auto_renew ? "default" : "secondary"}>
                    {domain.auto_renew ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">DNS Management</span>
                  <Badge variant={domain.dns_management ? "default" : "secondary"}>
                    {domain.dns_management ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nameservers */}
          {domain.nameservers && domain.nameservers.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  Nameservers
                </h3>
                <div className="space-y-2">
                  {domain.nameservers.map((ns, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3 font-mono text-sm">
                      {ns}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domain.enom_domain_id && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Provider Information
                  </h3>
                  <div className="text-sm">
                    <span className="font-medium">eNom Domain ID:</span> {domain.enom_domain_id}
                  </div>
                </CardContent>
              </Card>
            )}

            {domain.notes && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {domain.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Renewal Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Renewal Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Domain Renewal</p>
                    <p className="text-blue-700">
                      {domain.auto_renew 
                        ? "This domain will automatically renew before it expires."
                        : "This domain will not automatically renew. You'll need to renew it manually before the expiry date."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
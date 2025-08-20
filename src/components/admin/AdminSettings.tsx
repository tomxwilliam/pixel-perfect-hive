import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
import { Settings, Users, DollarSign, Link2, Bot, Globe, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminManagement from './settings/AdminManagement';
import ServicePricingDefaults from './settings/ServicePricingDefaults';
import APIIntegrations from './settings/APIIntegrations';
import AIAgentSettings from './settings/AIAgentSettings';
import DomainHostingSettings from './settings/DomainHostingSettings';
import { InvoiceTemplateSettings } from './InvoiceTemplateSettings';
import { AdminCommunications } from './AdminCommunications';
import { QuoteTemplateSettings } from './QuoteTemplateSettings';

const AdminSettings = () => {
  const { profile } = useAuth();
  
  // Check if user is super admin (tom@404codelab.com)
  const isSuperAdmin = profile?.email === 'tom@404codelab.com';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage admin permissions, pricing, integrations, and AI settings</p>
        </div>
      </div>

      <MobileTabs defaultValue="admins" className="space-y-6">
        <MobileTabsList className="w-full">
          <MobileTabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Admins</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Invoices</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Quotes</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Pricing</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Domains</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Integrations</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="text-xs sm:text-sm">AI Agent</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Comms</span>
          </MobileTabsTrigger>
        </MobileTabsList>

        <MobileTabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminManagement isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="invoices" className="space-y-6">
          <InvoiceTemplateSettings />
        </MobileTabsContent>

        <MobileTabsContent value="quotes" className="space-y-6">
          <QuoteTemplateSettings />
        </MobileTabsContent>

        <MobileTabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Service Pricing Defaults
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServicePricingDefaults isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain & Hosting Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DomainHostingSettings isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                API Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <APIIntegrations isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Google AI Agent Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIAgentSettings isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </MobileTabsContent>

        <MobileTabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Communication Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdminCommunications />
            </CardContent>
          </Card>
        </MobileTabsContent>
      </MobileTabs>
    </div>
  );
};

export default AdminSettings;
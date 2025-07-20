import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, DollarSign, Link2, Bot, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminManagement from './settings/AdminManagement';
import ServicePricingDefaults from './settings/ServicePricingDefaults';
import APIIntegrations from './settings/APIIntegrations';
import AIAgentSettings from './settings/AIAgentSettings';
import DomainHostingSettings from './settings/DomainHostingSettings';

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

      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domains
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Agent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
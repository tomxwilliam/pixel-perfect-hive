import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabs, MobileTabsContent, MobileTabsList, MobileTabsTrigger } from '@/components/ui/mobile-tabs';
import { Settings, Users, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import AdminManagement from './settings/AdminManagement';
import ServicePricingDefaults from './settings/ServicePricingDefaults';
import { InvoiceTemplateSettings } from './InvoiceTemplateSettings';
import { AdminCommunications } from './AdminCommunications';
import { QuoteTemplateSettings } from './QuoteTemplateSettings';
import { InvoiceSettings } from './settings/InvoiceSettings';

const AdminSettings = () => {
  const { user, profile } = useAuth();
  
  // Check if user is admin - using isAdmin from useAuth hook
  const { isAdmin: isSuperAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      
      <div className="container mx-auto p-6 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage admin permissions, pricing, and communications</p>
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
              <span className="text-xs sm:text-sm">Invoice Settings</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Quotes</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Pricing</span>
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
                <AdminManagement isSuperAdmin={isSuperAdmin} superAdminUserId={user?.id} />
              </CardContent>
            </Card>
          </MobileTabsContent>

          <MobileTabsContent value="invoices" className="space-y-6">
            <InvoiceSettings isSuperAdmin={isSuperAdmin} />
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
      
      <Footer />
    </div>
  );
};

export default AdminSettings;
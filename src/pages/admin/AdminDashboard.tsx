import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Users, FolderOpen, Ticket, DollarSign, TrendingUp, MessageSquare, Calendar, FileText, Settings, Globe, Server, Target, Calculator } from 'lucide-react';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import { AdminCustomers } from '@/components/admin/AdminCustomers';
import { AdminProjects } from '@/components/admin/AdminProjects';
import { AdminTickets } from '@/components/admin/AdminTickets';
import { CRMDashboard } from '@/components/admin/CRMDashboard';
import { AdminInvoices } from '@/components/admin/AdminInvoices';
import { AdminQuotes } from '@/components/admin/AdminQuotes';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminCalendar } from '@/components/admin/AdminCalendar';
import { AdminCommunications } from '@/components/admin/AdminCommunications';
// Social media removed
import AdminDomainManagement from '@/components/admin/AdminDomainManagement';
import AdminHostingManagement from '@/components/admin/AdminHostingManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import { AdminAccounting } from '@/components/admin/AdminAccounting';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = React.useState('overview');

  // Handle URL params for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin' || profile?.email === 'admin@404codelab.com';
  
  console.log('AdminDashboard check:', { 
    user: !!user, 
    profile: profile ? { role: profile.role, email: profile.email } : null,
    isAdmin 
  });
  
  if (!user || !isAdmin) {
    console.log('AdminDashboard access denied:', { user: !!user, isAdmin });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      <div className="container mx-auto p-6 pt-28">
        <div className={`mb-8 ${isMobile ? 'text-center' : ''}`}>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-foreground`}>Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Comprehensive business management and control center</p>
        </div>

        <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <MobileTabsList className="w-full">
            <MobileTabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Overview</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="crm" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-xs sm:text-sm">CRM</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Customers</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Projects</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Support</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Invoices</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Quotes</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Calendar</span>
            </MobileTabsTrigger>
            {/* Social media tab removed */}
            <MobileTabsTrigger value="domains" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Domains</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="hosting" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Hosting</span>
            </MobileTabsTrigger>
            {user?.email?.endsWith('@404codelab.com') && (
              <MobileTabsTrigger value="accounting" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Accounting</span>
              </MobileTabsTrigger>
            )}
            {user?.email?.endsWith('@404codelab.com') && (
              <MobileTabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Settings</span>
              </MobileTabsTrigger>
            )}
          </MobileTabsList>

          <MobileTabsContent value="overview">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminOverview />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="crm">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <CRMDashboard />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="customers">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminCustomers />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="projects">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminProjects />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="tickets">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminTickets />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="invoices">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminInvoices />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="quotes">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminQuotes />
            </React.Suspense>
          </MobileTabsContent>

          {user?.email?.endsWith('@404codelab.com') && (
            <MobileTabsContent value="accounting">
              <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <AdminAccounting />
              </React.Suspense>
            </MobileTabsContent>
          )}

          {user?.email?.endsWith('@404codelab.com') && (
            <MobileTabsContent value="settings">
              <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <AdminSettings />
              </React.Suspense>
            </MobileTabsContent>
          )}

          <MobileTabsContent value="calendar">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminCalendar />
            </React.Suspense>
          </MobileTabsContent>

          {/* Social media content removed */}

          <MobileTabsContent value="domains">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminDomainManagement />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="hosting">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminHostingManagement />
            </React.Suspense>
          </MobileTabsContent>
          
        </MobileTabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
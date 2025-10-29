import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Users, FolderOpen, Ticket, DollarSign, TrendingUp, MessageSquare, Calendar, FileText, Settings, Globe, Server, Target, Calculator, Gamepad2, Code, Smartphone, Star } from 'lucide-react';
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
import AdminSettings from '@/components/admin/AdminSettings';
import { AdminAccounting } from '@/components/admin/AdminAccounting';
import { AdminGames } from '@/components/admin/AdminGames';
import { AdminWebProjects } from '@/components/admin/AdminWebProjects';
import { AdminAppProjects } from '@/components/admin/AdminAppProjects';
import AdminFeaturedContent from '@/components/admin/AdminFeaturedContent';
import AdminBlog from '@/components/admin/AdminBlog';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = () => {
  const { user, profile, isAdmin, loading } = useAuth();
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

  // Show loading while auth is being determined
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Wait for profile to load before checking admin status
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if user is not admin (isAdmin from useAuth uses user_roles table)
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      <div className="container mx-auto p-6 pt-6">
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
            <MobileTabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Featured</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Games</span>
            </MobileTabsTrigger>
            
            <MobileTabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Blog</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="web" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Web</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="apps" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Apps</span>
            </MobileTabsTrigger>
            {isAdmin && (
              <MobileTabsTrigger value="accounting" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Accounting</span>
              </MobileTabsTrigger>
            )}
            {isAdmin && (
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

          {isAdmin && (
            <MobileTabsContent value="accounting">
              <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <AdminAccounting />
              </React.Suspense>
            </MobileTabsContent>
          )}

          {isAdmin && (
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

          <MobileTabsContent value="featured">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminFeaturedContent />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="games">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminGames />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="blog">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminBlog />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="web">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminWebProjects />
            </React.Suspense>
          </MobileTabsContent>

          <MobileTabsContent value="apps">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
              <AdminAppProjects />
            </React.Suspense>
          </MobileTabsContent>
          
        </MobileTabs>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
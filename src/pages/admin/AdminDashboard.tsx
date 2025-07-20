
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Users, FolderOpen, Ticket, DollarSign, TrendingUp, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AdminCustomers } from '@/components/admin/AdminCustomers';
import { AdminProjects } from '@/components/admin/AdminProjects';
import { AdminTickets } from '@/components/admin/AdminTickets';
import { AdminInvoices } from '@/components/admin/AdminInvoices';
import { AdminQuotes } from '@/components/admin/AdminQuotes';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminCalendar } from '@/components/admin/AdminCalendar';
import { AdminCommunications } from '@/components/admin/AdminCommunications';
import { AdminSocialMedia } from '@/components/admin/AdminSocialMedia';
import AdminSettings from '@/components/admin/AdminSettings';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6 pt-28">
        <div className={`mb-8 ${isMobile ? 'text-center' : ''}`}>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-foreground`}>Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Comprehensive business management and control center</p>
        </div>

        <MobileTabs defaultValue="overview" className="space-y-6">
          <MobileTabsList className={isMobile ? '' : 'grid w-full grid-cols-8'}>
            <MobileTabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </MobileTabsTrigger>
            <MobileTabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers
            </MobileTabsTrigger>
            <MobileTabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </MobileTabsTrigger>
            <MobileTabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Support
            </MobileTabsTrigger>
            <MobileTabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Invoices
            </MobileTabsTrigger>
            <MobileTabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quotes
            </MobileTabsTrigger>
            <MobileTabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </MobileTabsTrigger>
            <MobileTabsTrigger value="social" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Social
            </MobileTabsTrigger>
            <MobileTabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </MobileTabsTrigger>
            <MobileTabsTrigger value="settings" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Settings
            </MobileTabsTrigger>
          </MobileTabsList>

          <MobileTabsContent value="overview">
            <AdminOverview />
          </MobileTabsContent>

          <MobileTabsContent value="customers">
            <AdminCustomers />
          </MobileTabsContent>

          <MobileTabsContent value="projects">
            <AdminProjects />
          </MobileTabsContent>

          <MobileTabsContent value="tickets">
            <AdminTickets />
          </MobileTabsContent>

          <MobileTabsContent value="invoices">
            <AdminInvoices />
          </MobileTabsContent>

          <MobileTabsContent value="quotes">
            <AdminQuotes />
          </MobileTabsContent>

          <MobileTabsContent value="calendar">
            <AdminCalendar />
          </MobileTabsContent>

          <MobileTabsContent value="social">
            <AdminSocialMedia />
          </MobileTabsContent>

          <MobileTabsContent value="communications">
            <AdminCommunications />
          </MobileTabsContent>
          
          <MobileTabsContent value="settings">
            <AdminSettings />
          </MobileTabsContent>
        </MobileTabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

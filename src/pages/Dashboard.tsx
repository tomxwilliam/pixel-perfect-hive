
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CustomerStats } from '@/components/customer/CustomerStats';
import { useCustomerStats } from '@/hooks/useCustomerStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Navigation } from '@/components/Navigation';
import { CustomerProjects } from '@/components/customer/CustomerProjects';
import { CustomerTickets } from '@/components/customer/CustomerTickets';
import { CustomerInvoices } from '@/components/customer/CustomerInvoices';
import { CustomerQuotes } from '@/components/customer/CustomerQuotes';
import CustomerDomainsHosting from '@/components/customer/CustomerDomainsHosting';
import { NotificationCenter } from '@/components/customer/NotificationCenter';
import { ActivityTimeline } from '@/components/customer/ActivityTimeline';
import { MessageCenter } from '@/components/customer/MessageCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  User, 
  FolderOpen, 
  TicketIcon, 
  CreditCard, 
  Settings,
  Plus,
  Calendar,
  MessageCircle,
  FileText,
  BarChart,
  Bell,
  Activity,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { stats, loading: statsLoading } = useCustomerStats();
  const isMobile = useIsMobile();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const quickActions = [
    {
      title: 'New Project',
      description: 'Start a new project with us',
      icon: Plus,
      href: '/dashboard/projects/new',
      color: 'bg-blue-500'
    },
    {
      title: 'Support Ticket',
      description: 'Get help with existing projects',
      icon: TicketIcon,
      href: '/dashboard/tickets/new',
      color: 'bg-green-500'
    },
    {
      title: 'Book a Call',
      description: 'Schedule a consultation',
      icon: Calendar,
      href: '/dashboard/book-call',
      color: 'bg-purple-500'
    },
    {
      title: 'AI Assistant',
      description: 'Chat with our AI helper',
      icon: MessageCircle,
      href: '/dashboard/chat',
      color: 'bg-orange-500'
    }
  ];

  const statsCards = [
    { 
      label: 'Active Projects', 
      value: statsLoading ? '...' : stats.activeProjects.toString(), 
      icon: FolderOpen 
    },
    { 
      label: 'Open Tickets', 
      value: statsLoading ? '...' : stats.openTickets.toString(), 
      icon: TicketIcon 
    },
    { 
      label: 'Pending Invoices', 
      value: statsLoading ? '...' : `£${stats.pendingInvoices}`, 
      icon: CreditCard 
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header - Mobile Optimized */}
          <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center justify-between'} mb-8`}>
            <div className={`flex ${isMobile ? 'flex-col items-center text-center space-y-3' : 'items-center space-x-4'}`}>
              <Avatar className={`${isMobile ? 'h-20 w-20' : 'h-16 w-16'}`}>
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                  Welcome back, {profile?.first_name || 'there'}!
                </h1>
                <p className="text-muted-foreground">
                  {profile?.company_name && `${profile.company_name} • `}
                  {user?.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {profile?.role === 'admin' ? 'Administrator' : 'Customer'}
            </Badge>
          </div>

          {/* Stats Overview - Mobile Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} mb-8`}>
            {statsCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mr-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions - Mobile Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.color} text-white mb-3`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Tabs - Mobile Optimized */}
          <MobileTabs defaultValue="overview" className="space-y-6">
            <MobileTabsList className={isMobile ? '' : 'grid w-full grid-cols-9'}>
              <MobileTabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Overview
              </MobileTabsTrigger>
              <MobileTabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </MobileTabsTrigger>
              <MobileTabsTrigger value="tickets" className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Support
              </MobileTabsTrigger>
              <MobileTabsTrigger value="invoices" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </MobileTabsTrigger>
              <MobileTabsTrigger value="quotes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quotes
              </MobileTabsTrigger>
              <MobileTabsTrigger value="domains" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domains
              </MobileTabsTrigger>
              <MobileTabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </MobileTabsTrigger>
              <MobileTabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </MobileTabsTrigger>
              <MobileTabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </MobileTabsTrigger>
            </MobileTabsList>

            <MobileTabsContent value="overview" className="space-y-6">
              <CustomerStats />
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
                <CustomerProjects />
                <CustomerTickets />
              </div>
            </MobileTabsContent>

            <MobileTabsContent value="projects">
              <CustomerProjects />
            </MobileTabsContent>

            <MobileTabsContent value="tickets">
              <CustomerTickets />
            </MobileTabsContent>

            <MobileTabsContent value="invoices">
              <CustomerInvoices />
            </MobileTabsContent>

            <MobileTabsContent value="quotes">
              <CustomerQuotes />
            </MobileTabsContent>

            <MobileTabsContent value="domains">
              <CustomerDomainsHosting />
            </MobileTabsContent>

            <MobileTabsContent value="notifications">
              <NotificationCenter />
            </MobileTabsContent>

            <MobileTabsContent value="messages">
              <MessageCenter />
            </MobileTabsContent>

            <MobileTabsContent value="activity">
              <ActivityTimeline />
            </MobileTabsContent>
          </MobileTabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

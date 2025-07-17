import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navigation } from '@/components/Navigation';
import { 
  User, 
  FolderOpen, 
  TicketIcon, 
  CreditCard, 
  Settings,
  Plus,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();

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

  const stats = [
    { label: 'Active Projects', value: '0', icon: FolderOpen },
    { label: 'Open Tickets', value: '0', icon: TicketIcon },
    { label: 'Pending Invoices', value: '$0', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.first_name, profile?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
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

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
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

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.color} text-white mb-3`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest project activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet</p>
                  <Link to="/dashboard/projects/new">
                    <Button className="mt-4" size="sm">
                      Start Your First Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Support</CardTitle>
                <CardDescription>Your latest support interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No support tickets</p>
                  <Link to="/dashboard/tickets/new">
                    <Button className="mt-4" size="sm" variant="outline">
                      Get Help
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  MessageSquare, 
  Clock, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import { SupportTicketInbox } from './SupportTicketInbox';
import { SupportTicketForm } from './SupportTicketForm';
import { SupportReporting } from './SupportReporting';
import { KnowledgeBase } from './KnowledgeBase';

export const SupportDashboard = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'inbox' : 'tickets');

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      
      <div className="pt-20">
        <div className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">404 Code Lab Support</h1>
                <p className="text-muted-foreground">
                  Professional support system for our customers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  24/7 Support
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  &lt;1h Response
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
              {isAdmin && (
                <>
                  <TabsTrigger value="inbox" className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="reporting" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Reports
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {isAdmin ? 'All Tickets' : 'My Tickets'}
              </TabsTrigger>
              <TabsTrigger value="new-ticket" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                New Ticket
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Knowledge Base
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            {isAdmin && (
              <TabsContent value="inbox">
                <SupportTicketInbox />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="reporting">
                <SupportReporting />
              </TabsContent>
            )}

            <TabsContent value="tickets">
              <SupportTicketInbox showAllTickets={!isAdmin} />
            </TabsContent>

            <TabsContent value="new-ticket">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Create Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Describe your issue and we'll help you resolve it quickly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupportTicketForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge">
              <KnowledgeBase />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Support System Settings</CardTitle>
                    <CardDescription>
                      Configure your support system preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Settings panel will be available soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};
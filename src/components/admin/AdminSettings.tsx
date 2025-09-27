import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import DomainHostingSettings from './settings/DomainHostingSettings';

const AdminSettings = () => {
  const { profile } = useAuth();
  
  // Check if user is super admin (tom@404codelab.com)
  const isSuperAdmin = profile?.email === 'tom@404codelab.com';

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      
      <div className="container mx-auto p-6 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Domain Settings</h1>
            <p className="text-muted-foreground">Manage domain and hosting configuration</p>
          </div>
        </div>

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
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminSettings;
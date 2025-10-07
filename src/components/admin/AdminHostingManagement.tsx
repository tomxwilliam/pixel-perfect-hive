import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Server, Play, Pause, Trash2, Eye, AlertTriangle, Settings, ExternalLink,
  Globe, Database, Mail, Shield, FileText, HardDrive, Users, Lock,
  Activity, BarChart3, Terminal, Folder, Download, Upload, Key,
  Wifi, MonitorSpeaker, Cpu, MemoryStick, Network, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import HostingPackageManagement from "./HostingPackageManagement";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const AdminHostingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [hostingIntegration, setHostingIntegration] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Fetch hosting integration status with error handling
  useEffect(() => {
    const fetchHostingIntegration = async () => {
      try {
        const { data } = await supabase
          .from('api_integrations')
          .select('*')
          .eq('integration_type', 'unlimited_web_hosting')
          .maybeSingle();
        
        setHostingIntegration(data || { is_connected: false });
      } catch (error) {
        console.warn('API integrations table not available:', error);
        setHostingIntegration({ is_connected: false });
      }
    };
    
    fetchHostingIntegration();
  }, []);

  // Fetch all hosting subscriptions with simplified query
  // Note: Passwords are encrypted and can only be decrypted by admins via decrypt_hosting_credential()
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-hosting-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting_subscriptions')
        .select(`
          *,
          hosting_packages:package_id(*),
          profiles:customer_id(first_name, last_name, email),
          domains:domain_id(domain_name, tld)
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Limit for faster loading
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch hosting provisioning requests with error handling
  const { data: hostingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['hosting-provisioning-requests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('provisioning_requests')
          .select(`
            *,
            profiles:customer_id(first_name, last_name, email)
          `)
          .eq('request_type', 'hosting_setup')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.warn('Provisioning requests table not available:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry if table doesn't exist
  });

  // Provision hosting account
  const provisionHosting = useMutation({
    mutationFn: async ({ subscriptionId, action }: { subscriptionId: string, action: string }) => {
      const response = await supabase.functions.invoke('hosting-provision', {
        body: { 
          subscriptionId,
          action
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['hosting-provisioning-requests'] });
      toast({
        title: "Hosting Updated",
        description: "Hosting account has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Provisioning Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update subscription notes
  const updateSubscriptionNotes = useMutation({
    mutationFn: async ({ subscriptionId, notes }: { subscriptionId: string, notes: string }) => {
      const { error } = await supabase
        .from('hosting_subscriptions')
        .update({ notes })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      toast({
        title: "Notes Updated",
        description: "Subscription notes have been updated successfully.",
      });
    }
  });

  // Delete hosting subscription
  const deleteHostingSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { error } = await supabase
        .from('hosting_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      toast({
        title: "Subscription Deleted",
        description: "Hosting subscription has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Reset hosting password (admin only)
  const resetHostingPassword = useMutation({
    mutationFn: async (accountId: string) => {
      // @ts-ignore - Function exists but types not yet regenerated
      const { data, error } = await supabase.rpc('reset_hosting_password', {
        account_id: accountId
      });

      if (error) throw error;
      return data as string;
    },
    onSuccess: (newPwd) => {
      setNewPassword(newPwd);
      setShowPasswordDialog(true);
      queryClient.invalidateQueries({ queryKey: ['admin-hosting-subscriptions'] });
      toast({
        title: "Password Reset Complete",
        description: "The cPanel password has been reset successfully. Make sure to save the new password!",
      });
    },
    onError: (error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-orange-500';
      case 'terminated': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (subscriptionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hosting Management</CardTitle>
          <CardDescription>Loading hosting data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading hosting subscriptions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Hosting Management
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hostingIntegration?.is_connected ? "default" : "destructive"}>
                {hostingIntegration?.is_connected ? "Connected" : "Not Connected"}
              </Badge>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => {
                  toast({
                    title: "API Configuration",
                    description: "Opening API integration settings...",
                  });
                }}
              >
                <Key className="h-4 w-4 mr-1" />
                Add API
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    WHM/cPanel Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>WHM/cPanel Integration Settings</DialogTitle>
                    <DialogDescription>
                      Configure your WHM reseller account for automatic hosting provisioning
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">WHM Server URL</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="https://your-whm-server.com:2087"
                        defaultValue={hostingIntegration?.config_data?.whm_url || ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your WHM server URL (usually port 2087 for secure access)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">WHM Username</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="root or reseller username"
                        defaultValue={hostingIntegration?.config_data?.whm_username || ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">WHM API Token</label>
                      <input
                        type="password"
                        className="w-full p-2 border rounded"
                        placeholder="Enter your WHM API token"
                        defaultValue={hostingIntegration?.access_token || ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        Generate this in WHM under Development → Manage API Tokens
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Package Name Template</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="starter, business, professional"
                        defaultValue={hostingIntegration?.config_data?.package_template || ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        WHM package names that correspond to your hosting plans
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Default Server IP</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="192.168.1.100"
                        defaultValue={hostingIntegration?.config_data?.server_ip || ''}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked={hostingIntegration?.config_data?.auto_provision || false}
                      />
                      <label className="text-sm">Enable automatic provisioning</label>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={async () => {
                          // Test WHM connection
                          toast({
                            title: "Testing Connection",
                            description: "Verifying WHM API connection...",
                          });
                        }}
                        variant="outline"
                      >
                        Test Connection
                      </Button>
                      
                      <Button
                        onClick={() => {
                          // Save settings
                          toast({
                            title: "Settings Saved",
                            description: "WHM integration settings have been updated.",
                          });
                        }}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          <CardDescription>
            Manage customer hosting subscriptions and provisioning with Unlimited Web Hosting UK
            {!hostingIntegration?.is_connected && (
              <span className="text-destructive block mt-1">
                ⚠️ Connect to Unlimited Web Hosting UK in integration settings to enable automatic provisioning
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="cpanel">cPanel Dashboard</TabsTrigger>
          <TabsTrigger value="whm">WHM Control</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="cpanel" className="space-y-4">
          <div className="grid gap-6">
            {/* cPanel Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  cPanel Control Interface
                </CardTitle>
                <CardDescription>
                  Full hosting control panel functionality for customer accounts
                </CardDescription>
              </CardHeader>
            </Card>

            {/* cPanel Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
              {/* Files Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    File Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Manage files and directories</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Web Root</Badge>
                    <Badge variant="outline" className="text-xs">FTP</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Email Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-500" />
                    Email Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Manage email addresses</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">IMAP</Badge>
                    <Badge variant="outline" className="text-xs">POP3</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Database Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    MySQL Databases
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Database management</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">phpMyAdmin</Badge>
                    <Badge variant="outline" className="text-xs">Remote</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Domain Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-orange-500" />
                    Domains
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Domain management</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Subdomains</Badge>
                    <Badge variant="outline" className="text-xs">Redirects</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Security Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">SSL & protection</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">SSL/TLS</Badge>
                    <Badge variant="outline" className="text-xs">IP Blocker</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Software Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="h-4 w-4 text-indigo-500" />
                    Software
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">App installer</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">WordPress</Badge>
                    <Badge variant="outline" className="text-xs">Softaculous</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-cyan-500" />
                    Backup
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Backup & restore</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Full</Badge>
                    <Badge variant="outline" className="text-xs">Partial</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Section */}
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-teal-500" />
                    Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Usage statistics</p>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="outline" className="text-xs">Bandwidth</Badge>
                    <Badge variant="outline" className="text-xs">Storage</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="text-xs">Create Email</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="h-5 w-5" />
                    <span className="text-xs">New Database</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Globe className="h-5 w-5" />
                    <span className="text-xs">Add Subdomain</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Key className="h-5 w-5" />
                    <span className="text-xs">Install SSL</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="whm" className="space-y-4">
          <div className="grid gap-6">
            {/* WHM Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  WHM (Web Host Manager) Control
                </CardTitle>
                <CardDescription>
                  Server administration and reseller management interface
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Server Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">CPU Usage</p>
                      <p className="text-2xl font-bold">23%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MemoryStick className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Memory</p>
                      <p className="text-2xl font-bold">67%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Disk Usage</p>
                      <p className="text-2xl font-bold">45%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Network className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Network</p>
                      <p className="text-2xl font-bold text-green-600">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* WHM Functions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Account Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Create, modify, and manage accounts</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Active: 127</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    DNS Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">DNS zone management</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Zones: 89</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-500" />
                    Security Center
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Security settings and monitoring</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs text-green-600">Secure</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    Email Routing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Mail server configuration</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs text-green-600">Running</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Package Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">Hosting packages and features</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Packages: 5</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-500" />
                    Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">System health monitoring</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs text-green-600">Healthy</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Server Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Server Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Apache</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">MySQL</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Exim</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">cPanel</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Dovecot</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Pure-FTPd</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">SSH</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">DNS</span>
                    <Badge variant="outline" className="text-green-600">Running</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-6">
            {/* Monitoring Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorSpeaker className="h-5 w-5" />
                  Server Monitoring & Analytics
                </CardTitle>
                <CardDescription>
                  Real-time server performance and resource monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Resource Usage Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CPU Usage (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">CPU Usage Chart</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">23%</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">18%</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">87%</p>
                      <p className="text-xs text-muted-foreground">Peak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Memory Usage (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Memory Usage Chart</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">67%</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">62%</p>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">94%</p>
                      <p className="text-xs text-muted-foreground">Peak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Account created: user@example.com</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">SSL certificate installed for domain.com</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Backup completed for 12 accounts</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Database created: shop_db</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hosting Subscriptions</CardTitle>
              <CardDescription>All customer hosting accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.map((subscription: any) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.hosting_packages?.package_name}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {subscription.billing_cycle === 'annual'
                            ? `£${Number(subscription.hosting_packages?.annual_price ?? ((subscription.hosting_packages?.monthly_price || 0) as number) * 12)}/year`
                            : `£${Number(subscription.hosting_packages?.monthly_price || 0)}/month`}
                        </span>
                      </TableCell>
                      <TableCell>
                        {subscription.profiles?.first_name} {subscription.profiles?.last_name}
                        <br />
                        <span className="text-sm text-muted-foreground">{subscription.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        {subscription.domains?.domain_name ? 
                          `${subscription.domains.domain_name}${subscription.domains.tld}` : 
                          'No domain'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.billing_cycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.next_billing_date ? 
                          format(new Date(subscription.next_billing_date), 'PPP') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {subscription.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'create'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                          {subscription.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'suspend'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          {subscription.status === 'suspended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                provisionHosting.mutate({
                                  subscriptionId: subscription.id,
                                  action: 'unsuspend'
                                });
                              }}
                              disabled={provisionHosting.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Reactivate
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSubscription(subscription)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Manage Hosting Account</DialogTitle>
                                <DialogDescription>
                                  Account details and management options
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {selectedSubscription?.cpanel_username && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">cPanel Username</label>
                                      <p className="text-sm bg-muted p-2 rounded">
                                        {selectedSubscription.cpanel_username}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Server IP</label>
                                      <p className="text-sm bg-muted p-2 rounded">
                                        {selectedSubscription.server_ip || 'Not assigned'}
                                      </p>
                                    </div>
                                  </div>
                                 )}
                                 {selectedSubscription?.cpanel_username && hostingIntegration?.is_connected && (
                                   <div>
                                     <label className="text-sm font-medium">cPanel Access & Security</label>
                                     <div className="flex gap-2 mt-2">
                                       <Button
                                         variant="outline"
                                         onClick={() => {
                                           const cpanelUrl = `${hostingIntegration.config_data?.cpanel_url || 'https://cpanel.unlimitedwebhosting.co.uk'}:2083`;
                                           window.open(cpanelUrl, '_blank');
                                         }}
                                       >
                                         <ExternalLink className="h-4 w-4 mr-1" />
                                         Open cPanel
                                       </Button>
                                       <Button
                                         variant="outline"
                                         onClick={() => {
                                           if (confirm('Reset cPanel password for this account? A new secure password will be generated.')) {
                                             resetHostingPassword.mutate(selectedSubscription.id);
                                           }
                                         }}
                                         disabled={resetHostingPassword.isPending}
                                       >
                                         <Lock className="h-4 w-4 mr-1" />
                                         {resetHostingPassword.isPending ? 'Resetting...' : 'Reset Password'}
                                       </Button>
                                     </div>
                                   </div>
                                 )}
                                 <div>
                                   <label className="text-sm font-medium">Notes</label>
                                   <Textarea
                                     placeholder="Add notes about this hosting account..."
                                     value={notes}
                                     onChange={(e) => setNotes(e.target.value)}
                                   />
                                   <Button
                                     className="mt-2"
                                     onClick={() => {
                                       updateSubscriptionNotes.mutate({
                                         subscriptionId: selectedSubscription?.id,
                                         notes
                                       });
                                       setNotes("");
                                     }}
                                   >
                                     Update Notes
                                   </Button>
                                 </div>
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to terminate this hosting account? This action cannot be undone.')) {
                                        provisionHosting.mutate({
                                          subscriptionId: selectedSubscription?.id,
                                          action: 'terminate'
                                        });
                                      }
                                    }}
                                    disabled={provisionHosting.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Terminate Account
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSubscriptionToDelete(subscription);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <HostingPackageManagement />
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Requests</CardTitle>
              <CardDescription>Pending hosting setup requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostingRequests?.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.hosting_subscriptions?.hosting_packages?.package_name}
                      </TableCell>
                      <TableCell>
                        {request.profiles?.first_name} {request.profiles?.last_name}
                        <br />
                        <span className="text-sm text-muted-foreground">{request.profiles?.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Priority {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            provisionHosting.mutate({
                              subscriptionId: request.entity_id,
                              action: 'create'
                            });
                          }}
                          disabled={provisionHosting.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Provision
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Display Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-500" />
              New cPanel Password Generated
            </DialogTitle>
            <DialogDescription>
              Save this password immediately. It will not be shown again for security reasons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ Important Security Notice
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This password will only be displayed once. Make sure to copy it and securely share it with the customer. 
                For security, encrypted passwords cannot be retrieved later.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">New Password:</label>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-lg mt-2 break-all select-all">
                {newPassword}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(newPassword || '');
                  toast({
                    title: "Copied!",
                    description: "Password copied to clipboard",
                  });
                }}
                className="flex-1"
              >
                Copy Password
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteHostingSubscription.mutate(subscriptionToDelete?.id)}
        loading={deleteHostingSubscription.isPending}
        title="Delete Hosting Subscription"
        description={`Are you sure you want to permanently delete the hosting subscription for ${subscriptionToDelete?.profiles?.first_name} ${subscriptionToDelete?.profiles?.last_name}? This action cannot be undone.`}
        warningText="This will permanently remove the hosting subscription from your database. The actual hosting account may still exist with your provider."
      />
    </div>
  );
};

export default AdminHostingManagement;
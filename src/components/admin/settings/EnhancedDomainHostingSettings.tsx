import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Server, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Mail, 
  Send, 
  Eye, 
  RefreshCw,
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DomainHostingSettingsProps {
  isSuperAdmin: boolean;
}

export default function EnhancedDomainHostingSettings({ isSuperAdmin }: DomainHostingSettingsProps) {
  const [newTld, setNewTld] = useState("");
  const [newTldPrice, setNewTldPrice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [syncingPrices, setSyncingPrices] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch domain prices
  const { data: domainPrices, isLoading: pricesLoading } = useQuery({
    queryKey: ['domain-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domain_prices')
        .select('*')
        .order('tld');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch email templates
  const { data: emailTemplates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['domain-hosting-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domain_hosting_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('domain_hosting_settings')
        .update(updates)
        .eq('id', settings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-hosting-settings'] });
      toast({
        title: "Settings updated",
        description: "Domain & hosting settings have been saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Unable to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Sync prices mutation
  const syncPricesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-enom-prices');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['domain-prices'] });
      toast({
        title: "Pricing sync completed",
        description: `Updated ${data.updated_count} TLD prices from Enom`
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: "Unable to sync prices from Enom. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSyncPrices = async () => {
    setSyncingPrices(true);
    try {
      await syncPricesMutation.mutateAsync();
    } finally {
      setSyncingPrices(false);
    }
  };

  const handleToggleUpdate = async (field: string, value: boolean) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleNameserverUpdate = async (nameservers: string[]) => {
    updateSettingsMutation.mutate({ default_nameservers: nameservers });
  };

  const handleOverridePrice = async (tld: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    const { error } = await supabase
      .from('domain_prices')
      .update({
        retail_gbp: price,
        is_override: true,
        updated_at: new Date().toISOString()
      })
      .eq('tld', tld);

    if (error) {
      toast({
        title: "Update failed",
        description: "Unable to update price override",
        variant: "destructive"
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['domain-prices'] });
      toast({
        title: "Price updated",
        description: `Custom price set for ${tld}`
      });
    }
  };

  const handleRevertToEnom = async (tld: string) => {
    const { error } = await supabase
      .from('domain_prices')
      .update({
        is_override: false,
        updated_at: new Date().toISOString()
      })
      .eq('tld', tld);

    if (error) {
      toast({
        title: "Revert failed",
        description: "Unable to revert to Enom pricing",
        variant: "destructive"
      });
    } else {
      // Trigger a sync to get fresh Enom pricing
      await handleSyncPrices();
      toast({
        title: "Reverted to Enom",
        description: `${tld} now uses Enom pricing`
      });
    }
  };

  const handleSendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) {
      toast({
        title: "Missing fields",
        description: "Please select a template and enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      const template = emailTemplates?.find(t => t.id === selectedTemplate);
      if (!template) return;

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: template.subject,
          content: template.body_html,
          template_type: template.template_type,
          template_data: {
            customer_name: "Test Customer",
            domain_name: "example.com",
            hosting_package: "Premium Hosting",
            company_name: "404 Code Lab"
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `Test email successfully sent to ${testEmail}`
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "Unable to send test email. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading || pricesLoading) {
    return <div>Loading settings...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Only super administrators can access domain & hosting settings
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isStale = (dateString: string) => {
    return new Date(dateString) < new Date(Date.now() - 24 * 60 * 60 * 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Enhanced Domain & Hosting Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Toggles</CardTitle>
              <CardDescription>
                Enable or disable domain registration and hosting services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="domain-registration">Domain Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to search and register domains
                  </p>
                </div>
                <Switch
                  id="domain-registration"
                  checked={settings?.domain_registration_enabled || false}
                  onCheckedChange={(checked) => 
                    handleToggleUpdate('domain_registration_enabled', checked)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hosting-orders">Hosting Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to order hosting packages
                  </p>
                </div>
                <Switch
                  id="hosting-orders"
                  checked={settings?.hosting_orders_enabled || false}
                  onCheckedChange={(checked) => 
                    handleToggleUpdate('hosting_orders_enabled', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-provisioning">Auto Provisioning</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically provision services upon payment
                  </p>
                </div>
                <Switch
                  id="auto-provisioning"
                  checked={settings?.auto_provisioning || false}
                  onCheckedChange={(checked) => 
                    handleToggleUpdate('auto_provisioning', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Domain Pricing Management
                </CardTitle>
                <CardDescription>
                  Manage TLD pricing with Enom sync and custom overrides
                </CardDescription>
              </div>
              <Button 
                onClick={handleSyncPrices} 
                disabled={syncingPrices}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncingPrices ? 'animate-spin' : ''}`} />
                Refresh from Enom
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {domainPrices?.map((price) => (
                  <div key={price.tld} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono">
                        {price.tld}
                      </Badge>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">£{price.retail_gbp}</span>
                          {price.is_override && (
                            <Badge variant="secondary">Custom</Badge>
                          )}
                          {isStale(price.last_synced_at) && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Stale
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last synced: {formatTime(price.last_synced_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit {price.tld} Pricing</DialogTitle>
                            <DialogDescription>
                              Set custom pricing or revert to Enom rates
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Current Price (GBP)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                defaultValue={price.retail_gbp}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleOverridePrice(price.tld, e.target.value);
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              {price.is_override && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleRevertToEnom(price.tld)}
                                >
                                  Revert to Enom
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nameservers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Nameservers</CardTitle>
              <CardDescription>
                Configure default nameservers for new domain registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(settings?.default_nameservers || []).map((ns: string, index: number) => (
                <Input
                  key={index}
                  value={ns}
                  onChange={(e) => {
                    const updated = [...(settings?.default_nameservers || [])];
                    updated[index] = e.target.value;
                    handleNameserverUpdate(updated);
                  }}
                  placeholder={`Nameserver ${index + 1}`}
                />
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  const updated = [...(settings?.default_nameservers || []), ''];
                  handleNameserverUpdate(updated);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Nameserver
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Template Management
              </CardTitle>
              <CardDescription>
                Manage automated email templates with live editor and testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Email Templates</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendTestEmail}
                      disabled={!selectedTemplate || !testEmail}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Available Email Templates</h4>
                  <Badge variant="secondary">{emailTemplates?.length || 0} Templates</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emailTemplates?.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          {template.name}
                          {!template.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{template.template_type}</p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.subject}
                        </p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Status & Monitoring
              </CardTitle>
              <CardDescription>
                Monitor domain pricing sync status and system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Domain pricing is automatically synced nightly. Use manual refresh for immediate updates.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{domainPrices?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Total TLDs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {domainPrices?.filter(p => p.is_override).length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Custom Prices</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {domainPrices?.filter(p => isStale(p.last_synced_at)).length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Stale Prices</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
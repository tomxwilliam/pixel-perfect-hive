import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Server, Settings, Save, Plus, Trash2, Mail, Send, Eye, Edit, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface DomainHostingSettingsProps {
  isSuperAdmin: boolean;
}

export default function DomainHostingSettings({ isSuperAdmin }: DomainHostingSettingsProps) {
  const [newTld, setNewTld] = useState("");
  const [newTldPrice, setNewTldPrice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch domain settings
  const { data: domainSettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['domain-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domain_settings' as any)
        .select('*')
        .single();
      
      if (error) throw error;
      return data as any;
    }
  });

  // Fetch domain pricing from domain_prices table
  const { data: domainPricing, isLoading: isPricingLoading } = useQuery({
    queryKey: ['domain-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domain_prices' as any)
        .select('*')
        .order('tld');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch email templates
  const { data: emailTemplates, isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates' as any)
        .select('*')
        .order('category, name');
      
      if (error) throw error;
      return data as any[];
    }
  });

  // Update domain settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('domain_settings' as any)
        .update(updates)
        .eq('id', domainSettings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-settings'] });
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

  // Update email template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase
        .from('email_templates' as any)
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: "Template updated",
        description: "Email template has been saved successfully"
      });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Unable to update template. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string, email: string }) => {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { templateId, email }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "Test email has been sent successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "Unable to send test email. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleToggleUpdate = async (field: string, value: boolean) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleNameserverUpdate = async (nameservers: string[]) => {
    updateSettingsMutation.mutate({ nameservers });
  };

  const handleAddTldPricing = async () => {
    if (!newTld || !newTldPrice) return;
    
    const { error } = await supabase
      .from('domain_prices' as any)
      .insert({
        tld: newTld.startsWith('.') ? newTld : `.${newTld}`,
        retail_gbp: parseFloat(newTldPrice),
        retail_usd: parseFloat(newTldPrice) / 0.79, // Convert GBP to USD using approx rate
        id_protect_gbp: 7.99,
        source: 'manual',
        is_override: true
      });
    
    if (error) {
      toast({
        title: "Error adding TLD",
        description: error.message,
        variant: "destructive"
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['domain-prices'] });
      setNewTld("");
      setNewTldPrice("");
      toast({
        title: "TLD added",
        description: "Domain pricing has been added successfully"
      });
    }
  };

  const handleRemoveTldPricing = async (tld: string) => {
    const { error } = await supabase
      .from('domain_prices' as any)
      .delete()
      .eq('tld', tld);
    
    if (error) {
      toast({
        title: "Error removing TLD",
        description: error.message,
        variant: "destructive"
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['domain-prices'] });
      toast({
        title: "TLD removed",
        description: "Domain pricing has been removed successfully"
      });
    }
  };

  const handleSyncFromEnom = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-enom-prices');
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['domain-prices'] });
      toast({
        title: "Sync completed",
        description: `Updated ${data.updated_count} domain prices from Enom`
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync pricing from Enom",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.body_html || template.body);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    updateTemplateMutation.mutate({
      id: editingTemplate.id,
      updates: {
        subject: editSubject,
        body_html: editBody,
        updated_at: new Date().toISOString()
      }
    });
  };

  const handleSendTestEmail = async (templateId: string) => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }
    
    sendTestEmailMutation.mutate({ templateId, email: testEmail });
  };

  const handleResetTemplate = async (templateId: string) => {
    // This would reset the template to its default value
    // Implementation would need a way to store/retrieve default templates
    toast({
      title: "Reset template",
      description: "Template reset functionality to be implemented",
    });
  };

  if (isSettingsLoading || isPricingLoading || isTemplatesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading domain & hosting settings...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You need super admin privileges to access domain & hosting settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const templatesByCategory = emailTemplates?.reduce((acc: any, template: any) => {
    const category = template.category || 'uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Domain & Hosting Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Service Toggles
              </CardTitle>
              <CardDescription>
                Control which services are available to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Domain Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to register new domains
                  </p>
                </div>
                <Switch
                  checked={domainSettings?.allow_domains || false}
                  onCheckedChange={(checked) => handleToggleUpdate('allow_domains', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hosting Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to order hosting packages
                  </p>
                </div>
                <Switch
                  checked={domainSettings?.allow_hosting || false}
                  onCheckedChange={(checked) => handleToggleUpdate('allow_hosting', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Provisioning</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically provision services after payment
                  </p>
                </div>
                <Switch
                  checked={domainSettings?.auto_provisioning || false}
                  onCheckedChange={(checked) => handleToggleUpdate('auto_provisioning', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domain Pricing Management
              </CardTitle>
              <CardDescription>
                Manage domain TLD pricing and sync with Enom
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add TLD Form */}
              <div className="flex gap-2">
                <Input
                  placeholder="TLD (e.g., .com)"
                  value={newTld}
                  onChange={(e) => setNewTld(e.target.value)}
                />
                <Input
                  placeholder="Price (GBP)"
                  type="number"
                  step="0.01"
                  value={newTldPrice}
                  onChange={(e) => setNewTldPrice(e.target.value)}
                />
                <Button onClick={handleAddTldPricing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add TLD
                </Button>
              </div>

              {/* Sync from Enom Button */}
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={handleSyncFromEnom}
                  disabled={isSyncing}
                  variant="outline"
                >
                  {isSyncing ? "Syncing..." : "Sync from Enom"}
                </Button>
              </div>

              {/* Domain Pricing Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 border-b">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm">
                    <div>TLD</div>
                    <div className="text-center">Register Price</div>
                    <div className="text-center">Renew Price</div>
                    <div className="text-center">Transfer Price</div>
                    <div className="text-center">Status</div>
                    <div className="text-center">Actions</div>
                  </div>
                </div>
                <div className="divide-y">
                  {isPricingLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading pricing data...
                    </div>
                  ) : (
                    <>
                      {domainPricing?.map((pricing) => (
                        <div key={pricing.id} className="grid grid-cols-6 gap-4 p-4 items-center">
                          {/* TLD */}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {pricing.tld}
                            </Badge>
                          </div>
                          
                          {/* Register Price */}
                          <div className="text-center">
                            <span className="font-medium text-green-600">
                              £{pricing.register_price_gbp || pricing.retail_gbp}
                            </span>
                            <p className="text-xs text-muted-foreground">registration</p>
                          </div>
                          
                          {/* Renew Price */}
                          <div className="text-center">
                            <span className="font-medium text-blue-600">
                              £{pricing.renew_price_gbp || pricing.retail_gbp}
                            </span>
                            <p className="text-xs text-muted-foreground">renewal</p>
                          </div>
                          
                          {/* Transfer Price */}
                          <div className="text-center">
                            <span className="font-medium text-purple-600">
                              £{pricing.transfer_price_gbp || pricing.retail_gbp}
                            </span>
                            <p className="text-xs text-muted-foreground">transfer</p>
                          </div>
                          
                          {/* Status */}
                          <div className="text-center">
                            <Badge variant={pricing.source === 'enom' ? 'default' : 'secondary'} className="text-xs">
                              {pricing.source === 'enom' ? 'Enom Sync' : 'Manual'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {pricing.last_synced_at ? 
                                new Date(pricing.last_synced_at).toLocaleDateString() : 
                                new Date(pricing.updated_at).toLocaleDateString()
                              }
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveTldPricing(pricing.tld)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty state */}
                      {(!domainPricing || domainPricing.length === 0) && (
                        <div className="p-8 text-center text-muted-foreground">
                          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No domain pricing configured</p>
                          <p className="text-sm">Add TLDs above or sync from Enom</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nameservers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Default Nameservers
              </CardTitle>
              <CardDescription>
                Configure default nameservers for new domain registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {domainSettings?.nameservers?.map((ns: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={ns}
                      onChange={(e) => {
                        const newNameservers = [...(domainSettings.nameservers || [])];
                        newNameservers[index] = e.target.value;
                        handleNameserverUpdate(newNameservers);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newNameservers = domainSettings.nameservers?.filter((_: any, i: number) => i !== index) || [];
                        handleNameserverUpdate(newNameservers);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  const newNameservers = [...(domainSettings?.nameservers || []), ''];
                  handleNameserverUpdate(newNameservers);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Nameserver
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Templates Management
              </CardTitle>
              <CardDescription>
                Manage email templates for domain and hosting notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Email Input */}
              <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Enter test email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  type="email"
                />
                <Button variant="outline" size="sm" disabled={!testEmail}>
                  Set Test Email
                </Button>
              </div>

              {/* Templates by Category */}
              {Object.entries(templatesByCategory).map(([category, templates]: [string, any]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <Badge variant="secondary">{templates.length}</Badge>
                  </div>
                  
                  <div className="grid gap-4">
                    {templates.map((template: any) => (
                      <div key={template.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.name.replace('_', ' ')}</h4>
                            <p className="text-sm text-muted-foreground">
                              Subject: {template.subject}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendTestEmail(template.id)}
                              disabled={!testEmail || sendTestEmailMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetTemplate(template.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Last updated: {new Date(template.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Modify the subject and body of the email template. Use {"{{variable}}"} for dynamic content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Email subject line"
              />
            </div>
            
            <div>
              <Label htmlFor="body">Body (HTML)</Label>
              <Textarea
                id="body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Email body content"
                rows={15}
                className="font-mono"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={updateTemplateMutation.isPending}>
              {updateTemplateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Server, Settings, Save, Plus, Trash2, Mail, Send, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DomainHostingSettingsProps {
  isSuperAdmin: boolean;
}

export default function DomainHostingSettings({ isSuperAdmin }: DomainHostingSettingsProps) {
  const [newTld, setNewTld] = useState("");
  const [newTldPrice, setNewTldPrice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleToggleUpdate = async (field: string, value: boolean) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleNameserverUpdate = async (nameservers: string[]) => {
    updateSettingsMutation.mutate({ default_nameservers: nameservers });
  };

  const handleAddTldPricing = async () => {
    if (!newTld || !newTldPrice) return;
    
    const currentPricing = (settings?.domain_pricing as Record<string, number>) || {};
    const updatedPricing = {
      ...currentPricing,
      [newTld]: parseFloat(newTldPrice)
    };
    
    updateSettingsMutation.mutate({ domain_pricing: updatedPricing });
    setNewTld("");
    setNewTldPrice("");
  };

  const handleRemoveTldPricing = async (tld: string) => {
    const currentPricing = (settings?.domain_pricing as Record<string, number>) || {};
    const { [tld]: removed, ...updatedPricing } = currentPricing;
    
    updateSettingsMutation.mutate({ domain_pricing: updatedPricing });
  };

  const handleEmailTemplateUpdate = async (templateKey: string, field: string, value: string) => {
    const currentTemplates = (settings?.email_templates as Record<string, any>) || {};
    const updatedTemplates = {
      ...currentTemplates,
      [templateKey]: {
        ...(currentTemplates[templateKey] || {}),
        [field]: value
      }
    };
    
    updateSettingsMutation.mutate({ email_templates: updatedTemplates });
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
      const { error } = await supabase.functions.invoke('send-domain-hosting-email', {
        body: {
          to: testEmail,
          template: selectedTemplate,
          data: {
            customer_name: "Test Customer",
            domain_name: "example.com",
            hosting_package: "Premium Hosting",
            expiry_date: "2024-12-31",
            invoice_number: "INV-12345",
            amount: "£29.99",
            usage_percentage: 85,
            ticket_number: "12345",
            ticket_subject: "Test Support Request"
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

  const emailTemplates = [
    { value: 'domain-registration-confirmation', label: 'Domain Registration Confirmation' },
    { value: 'domain-transfer-initiated', label: 'Domain Transfer Initiated' },
    { value: 'domain-transfer-completed', label: 'Domain Transfer Completed' },
    { value: 'domain-renewal-reminder-30', label: 'Domain Renewal Reminder (30 days)' },
    { value: 'domain-renewal-reminder-7', label: 'Domain Renewal Reminder (7 days)' },
    { value: 'domain-expired', label: 'Domain Expired Notice' },
    { value: 'domain-redemption', label: 'Domain Redemption Notice' },
    { value: 'hosting-account-setup', label: 'Hosting Account Setup' },
    { value: 'hosting-renewal-reminder-30', label: 'Hosting Renewal Reminder (30 days)' },
    { value: 'hosting-renewal-reminder-7', label: 'Hosting Renewal Reminder (7 days)' },
    { value: 'hosting-expired', label: 'Hosting Expired Notice' },
    { value: 'resource-usage-alert', label: 'Resource Usage Alert' },
    { value: 'nameserver-update', label: 'Nameserver Update Confirmation' },
    { value: 'email-hosting-setup', label: 'Email Hosting Setup' },
    { value: 'invoice-payment-receipt', label: 'Invoice Payment Receipt' },
    { value: 'failed-payment-retry', label: 'Failed Payment Retry' },
    { value: 'auto-renewal-confirmation', label: 'Auto-Renewal Confirmation' },
    { value: 'account-verification', label: 'Account Verification' },
    { value: 'password-reset', label: 'Password Reset' },
    { value: 'hosting-suspension', label: 'Hosting Suspension Notice' },
    { value: 'hosting-termination', label: 'Hosting Termination Notice' },
    { value: 'support-ticket-opened', label: 'Support Ticket Opened' },
    { value: 'support-ticket-update', label: 'Support Ticket Update' },
    { value: 'support-ticket-closed', label: 'Support Ticket Closed' }
  ];

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Domain & Hosting Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
          <TabsTrigger value="emails">Email Templates</TabsTrigger>
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
            <CardHeader>
              <CardTitle>Domain Pricing</CardTitle>
              <CardDescription>
                Set default pricing for different domain TLDs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="TLD (e.g., com, net, org)"
                  value={newTld}
                  onChange={(e) => setNewTld(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Price (£)"
                  value={newTldPrice}
                  onChange={(e) => setNewTldPrice(e.target.value)}
                />
                <Button onClick={handleAddTldPricing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries((settings?.domain_pricing as Record<string, number>) || {}).map(([tld, price]) => (
                  <div key={tld} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.{tld}</Badge>
                      <span className="font-medium">£{price as number}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveTldPricing(tld)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                Professional Email Templates
              </CardTitle>
              <CardDescription>
                Manage all domain and hosting email templates. These are professionally designed React Email templates that are automatically sent for various events.
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
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
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
                  <Badge variant="secondary">{emailTemplates.length} Templates</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { category: 'Domain Management', templates: emailTemplates.slice(0, 7), color: 'bg-blue-50 dark:bg-blue-950' },
                    { category: 'Hosting Services', templates: emailTemplates.slice(7, 12), color: 'bg-green-50 dark:bg-green-950' },
                    { category: 'Technical & DNS', templates: emailTemplates.slice(12, 14), color: 'bg-purple-50 dark:bg-purple-950' },
                    { category: 'Billing & Payments', templates: emailTemplates.slice(14, 17), color: 'bg-orange-50 dark:bg-orange-950' },
                    { category: 'Security & Support', templates: emailTemplates.slice(17), color: 'bg-red-50 dark:bg-red-950' }
                  ].map((category) => (
                    <Card key={category.category} className={category.color}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {category.templates.map((template) => (
                          <div key={template.value} className="flex items-center justify-between p-2 bg-background/60 rounded text-xs">
                            <span className="font-medium">{template.label}</span>
                            <Badge variant="outline" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Ready
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Professional Email Templates Ready</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    All email templates are professionally designed React Email components that automatically send beautiful, branded emails for domain and hosting events.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">✅ Responsive Design</Badge>
                    <Badge variant="secondary">✅ Dark Mode Support</Badge>
                    <Badge variant="secondary">✅ Brand Customizable</Badge>
                    <Badge variant="secondary">✅ Dynamic Content</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
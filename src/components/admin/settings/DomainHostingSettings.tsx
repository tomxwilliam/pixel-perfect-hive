import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Server, Settings, Save, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DomainHostingSettingsProps {
  isSuperAdmin: boolean;
}

export default function DomainHostingSettings({ isSuperAdmin }: DomainHostingSettingsProps) {
  const [newTld, setNewTld] = useState("");
  const [newTldPrice, setNewTldPrice] = useState("");
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
              <CardTitle>Domain Welcome Email</CardTitle>
              <CardDescription>
                Customize the email sent when a domain is successfully registered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain-subject">Subject Line</Label>
                <Input
                  id="domain-subject"
                  value={((settings?.email_templates as any)?.domain_welcome?.subject) || ''}
                  onChange={(e) => 
                    handleEmailTemplateUpdate('domain_welcome', 'subject', e.target.value)
                  }
                  placeholder="Email subject..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain-template">Email Template</Label>
                <Textarea
                  id="domain-template"
                  value={((settings?.email_templates as any)?.domain_welcome?.template) || ''}
                  onChange={(e) => 
                    handleEmailTemplateUpdate('domain_welcome', 'template', e.target.value)
                  }
                  placeholder="Email template... Use {{domain_name}} for dynamic content"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hosting Welcome Email</CardTitle>
              <CardDescription>
                Customize the email sent when hosting is provisioned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hosting-subject">Subject Line</Label>
                <Input
                  id="hosting-subject"
                  value={((settings?.email_templates as any)?.hosting_welcome?.subject) || ''}
                  onChange={(e) => 
                    handleEmailTemplateUpdate('hosting_welcome', 'subject', e.target.value)
                  }
                  placeholder="Email subject..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hosting-template">Email Template</Label>
                <Textarea
                  id="hosting-template"
                  value={((settings?.email_templates as any)?.hosting_welcome?.template) || ''}
                  onChange={(e) => 
                    handleEmailTemplateUpdate('hosting_welcome', 'template', e.target.value)
                  }
                  placeholder="Email template... Use {{cpanel_username}}, {{cpanel_password}} for dynamic content"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
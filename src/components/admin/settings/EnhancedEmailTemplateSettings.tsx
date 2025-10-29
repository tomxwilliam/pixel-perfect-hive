import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye,
  Copy,
  Save,
  X,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  template_type: string;
  category: string;
  variables: string[];
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const templateCategories = [
  { value: 'domain', label: 'Domain Management', color: 'bg-blue-50 dark:bg-blue-950' },
  { value: 'hosting', label: 'Hosting Services', color: 'bg-green-50 dark:bg-green-950' },
  { value: 'billing', label: 'Billing & Payments', color: 'bg-orange-50 dark:bg-orange-950' },
  { value: 'technical', label: 'Technical & DNS', color: 'bg-purple-50 dark:bg-purple-950' },
  { value: 'support', label: 'Security & Support', color: 'bg-red-50 dark:bg-red-950' },
  { value: 'general', label: 'General', color: 'bg-gray-50 dark:bg-gray-950' }
];

const defaultTemplates = [
  {
    name: 'Domain Registration Confirmation',
    category: 'domain',
    template_type: 'domain_registration',
    subject: 'Domain Registration Successful - {{domain_name}}',
    body_html: `<h1>Domain Registration Confirmed</h1>
<p>Dear {{customer_name}},</p>
<p>Your domain <strong>{{domain_name}}</strong> has been successfully registered!</p>
<div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
  <h3>Registration Details:</h3>
  <ul>
    <li>Domain: {{domain_name}}</li>
    <li>Registration Date: {{registration_date}}</li>
    <li>Expiry Date: {{expiry_date}}</li>
    <li>Nameservers: {{nameservers}}</li>
  </ul>
</div>
<p>Your domain is now active and ready to use!</p>
<p>Best regards,<br>{{company_name}} Team</p>`,
    variables: ['customer_name', 'domain_name', 'registration_date', 'expiry_date', 'nameservers', 'company_name']
  },
  {
    name: 'Hosting Account Setup',
    category: 'hosting',
    template_type: 'hosting_setup',
    subject: 'Hosting Account Ready - {{domain_name}}',
    body_html: `<h1>Your Hosting Account is Ready!</h1>
<p>Dear {{customer_name}},</p>
<p>Your hosting account for <strong>{{domain_name}}</strong> has been set up successfully.</p>
<div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; margin: 20px 0;">
  <h3>Account Details:</h3>
  <ul>
    <li>Domain: {{domain_name}}</li>
    <li>cPanel Username: {{cpanel_username}}</li>
    <li>cPanel Password: {{cpanel_password}}</li>
    <li>Server IP: {{server_ip}}</li>
    <li>Package: {{hosting_package}}</li>
  </ul>
</div>
<p><strong>Important:</strong> Please save these details securely and change your password upon first login.</p>
<p>Best regards,<br>{{company_name}} Team</p>`,
    variables: ['customer_name', 'domain_name', 'cpanel_username', 'cpanel_password', 'server_ip', 'hosting_package', 'company_name']
  },
  {
    name: 'Payment Receipt',
    category: 'billing',
    template_type: 'payment_receipt',
    subject: 'Payment Received - Invoice {{invoice_number}}',
    body_html: `<h1>Payment Confirmation</h1>
<p>Dear {{customer_name}},</p>
<p>Thank you for your payment. We have successfully received your payment for invoice {{invoice_number}}.</p>
<div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 15px; margin: 20px 0;">
  <h3>Payment Details:</h3>
  <ul>
    <li>Invoice Number: {{invoice_number}}</li>
    <li>Amount Paid: {{amount}}</li>
    <li>Payment Date: {{payment_date}}</li>
    <li>Payment Method: {{payment_method}}</li>
  </ul>
</div>
<p>Your services will continue uninterrupted.</p>
<p>Best regards,<br>{{company_name}} Team</p>`,
    variables: ['customer_name', 'invoice_number', 'amount', 'payment_date', 'payment_method', 'company_name']
  }
];

export function EnhancedEmailTemplateSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    template_type: 'general',
    category: 'general',
    variables: [] as string[],
    is_active: true,
    is_system: false
  });

  useEffect(() => {
    fetchTemplates();
    createDefaultTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Convert variables from JSON to string array
      const processedData = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) ? template.variables as string[] : [],
        category: template.category || 'general',
        body_text: template.body_text || '',
        is_active: template.is_active ?? true,
        is_system: template.is_system ?? false
      })) as EmailTemplate[];
      
      setTemplates(processedData);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplates = async () => {
    try {
      // Check if default templates exist
      const { data: existing } = await supabase
        .from('email_templates')
        .select('template_type')
        .in('template_type', defaultTemplates.map(t => t.template_type));

      const existingTypes = existing?.map(t => t.template_type) || [];
      const templatesToCreate = defaultTemplates.filter(t => !existingTypes.includes(t.template_type));

      if (templatesToCreate.length > 0) {
        const { error } = await supabase
          .from('email_templates')
          .insert(templatesToCreate.map(template => ({
            ...template,
            is_system: true,
            is_active: true
          })));

        if (error) throw error;
        console.log(`Created ${templatesToCreate.length} default templates`);
      }
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.subject || !formData.body_html) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const templateData = {
        ...formData,
        variables: extractVariables(formData.body_html + ' ' + formData.subject),
        updated_at: new Date().toISOString()
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: "Success", description: "Email template updated successfully" });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);

        if (error) throw error;
        toast({ title: "Success", description: "Email template created successfully" });
      }

      await fetchTemplates();
      handleCancel();
    } catch (error) {
      console.error('Error saving email template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      template_type: template.template_type,
      category: template.category,
      variables: template.variables || [],
      is_active: template.is_active,
      is_system: template.is_system
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
      template_type: 'general',
      category: 'general',
      variables: [],
      is_active: true,
      is_system: false
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      body_text: '',
      template_type: 'general',
      category: 'general',
      variables: [],
      is_active: true,
      is_system: false
    });
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this email template?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      toast({ title: "Success", description: "Email template deleted successfully" });
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting email template:', error);
      toast({
        title: "Error",
        description: "Failed to delete email template",
        variant: "destructive",
      });
    }
  };

  const handleSendTest = async (template: EmailTemplate) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: template.subject,
          content: template.body_html,
          template_type: template.template_type,
          template_data: {
            customer_name: 'Test User',
            company_name: '404 Code Lab',
            domain_name: 'example.com',
            date: new Date().toLocaleDateString(),
            invoice_number: 'INV-12345',
            amount: '£29.99'
          }
        }
      });

      if (error) throw error;
      toast({ title: "Success", description: "Test email sent successfully" });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error", 
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = templateCategories.reduce((acc, category) => {
    acc[category.value] = filteredTemplates.filter(t => t.category === category.value);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enhanced Email Templates</h1>
          <p className="text-muted-foreground">
            Advanced email template management with categorisation and live preview
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchTemplates()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !!editingTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {templateCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {(isCreating || editingTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Template Type</Label>
                <Input
                  id="type"
                  value={formData.template_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value }))}
                  placeholder="e.g., welcome, invoice"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
              <p className="text-xs text-muted-foreground">
                Use &#123;&#123;variable_name&#125;&#125; for dynamic content
              </p>
            </div>

            <Tabs defaultValue="html" className="space-y-4">
              <TabsList>
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="space-y-2">
                <Label htmlFor="body_html">Email Content (HTML) *</Label>
                <Textarea
                  id="body_html"
                  value={formData.body_html}
                  onChange={(e) => setFormData(prev => ({ ...prev, body_html: e.target.value }))}
                  placeholder="Enter email HTML content"
                  className="min-h-[300px] font-mono text-sm"
                />
              </TabsContent>
              
              <TabsContent value="text" className="space-y-2">
                <Label htmlFor="body_text">Email Content (Plain Text)</Label>
                <Textarea
                  id="body_text"
                  value={formData.body_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, body_text: e.target.value }))}
                  placeholder="Enter plain text version (optional)"
                  className="min-h-[200px]"
                />
              </TabsContent>
              
              <TabsContent value="preview">
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-2">Subject: {formData.subject}</h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: formData.body_html }}
                    className="prose max-w-none"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="active">Active Template</Label>
                </div>
                {formData.is_system && (
                  <Badge variant="secondary">System Template</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates by Category */}
      <div className="space-y-6">
        {templateCategories.map(category => {
          const categoryTemplates = groupedTemplates[category.value] || [];
          if (categoryTemplates.length === 0 && filterCategory !== 'all' && filterCategory !== category.value) {
            return null;
          }

          return (
            <Card key={category.value} className={category.color}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {category.label}
                  </CardTitle>
                  <Badge variant="outline">
                    {categoryTemplates.length} templates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {categoryTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates in this category
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {categoryTemplates.map((template) => (
                      <Card key={template.id} className="bg-background/60">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-sm">
                                {template.name}
                                {!template.is_active && (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                                {template.is_system && (
                                  <Badge variant="outline">System</Badge>
                                )}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                {template.subject}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewTemplate(template)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(template)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendTest(template)}
                                disabled={!testEmail || sending}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                              {!template.is_system && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(template.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate.name}</DialogTitle>
              <DialogDescription>
                Template preview with sample data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {previewTemplate.subject}
                </div>
              </div>
              <div>
                <Label>HTML Content</Label>
                <div 
                  className="p-4 bg-white border rounded"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }}
                />
              </div>
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <Label>Available Variables</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {previewTemplate.variables.map(variable => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        &#123;&#123;{variable}&#125;&#125;
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Eye,
  Copy,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function EmailTemplateSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: '',
    template_type: 'general',
    is_active: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
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

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            body_text: formData.body_text,
            template_type: formData.template_type,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Email template updated successfully",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            name: formData.name,
            subject: formData.subject,
            body_html: formData.body_html,
            body_text: formData.body_text,
            template_type: formData.template_type,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Email template created successfully",
        });
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

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      template_type: template.template_type,
      is_active: template.is_active
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
      is_active: true
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
      is_active: true
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

      toast({
        title: "Success",
        description: "Email template deleted successfully",
      });

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

  const handleDuplicate = (template: EmailTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      template_type: template.template_type,
      is_active: false
    });
    setIsCreating(true);
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
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: template.subject,
          content: template.body_html,
          template_type: template.template_type,
          template_data: {
            customer_name: 'Test User',
            company_name: '404 Code Lab',
            date: new Date().toLocaleDateString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test email sent successfully",
      });
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

  const templateTypes = [
    { value: 'general', label: 'General' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'quote', label: 'Quote' },
    { value: 'project_update', label: 'Project Update' },
    { value: 'support', label: 'Support' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'reminder', label: 'Reminder' }
  ];

  const defaultTemplates = {
    welcome: {
      subject: 'Welcome to {{company_name}}!',
      body_html: `
        <h1>Welcome {{customer_name}}!</h1>
        <p>Thank you for choosing {{company_name}}. We're excited to work with you!</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The {{company_name}} Team</p>
      `
    },
    invoice: {
      subject: 'Invoice #{{invoice_number}} from {{company_name}}',
      body_html: `
        <h1>Invoice #{{invoice_number}}</h1>
        <p>Dear {{customer_name}},</p>
        <p>Please find your invoice attached. The total amount due is {{amount}}.</p>
        <p>Due date: {{due_date}}</p>
        <p>Thank you for your business!</p>
        <p>Best regards,<br>{{company_name}}</p>
      `
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates for automated communications
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating || !!editingTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="type">Template Type</Label>
                <select
                  id="type"
                  value={formData.template_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
                Use &#123;&#123;variable_name&#125;&#125; for dynamic content (e.g., &#123;&#123;customer_name&#125;&#125;, &#123;&#123;company_name&#125;&#125;)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_html">Email Content (HTML) *</Label>
              <Textarea
                id="body_html"
                value={formData.body_html}
                onChange={(e) => setFormData(prev => ({ ...prev, body_html: e.target.value }))}
                placeholder="Enter email HTML content"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_text">Email Content (Plain Text)</Label>
              <Textarea
                id="body_text"
                value={formData.body_text}
                onChange={(e) => setFormData(prev => ({ ...prev, body_text: e.target.value }))}
                placeholder="Enter plain text version (optional)"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="active">Active Template</Label>
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
              <Button 
                variant="outline" 
                onClick={() => setPreviewTemplate({ 
                  ...formData, 
                  id: 'preview', 
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as EmailTemplate)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Templates */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No email templates found</p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {template.name}
                      {!template.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Type: {templateTypes.find(t => t.value === template.template_type)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Subject:</strong> {template.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                  
                  {/* Test Email Section */}
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      placeholder="Test email address"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSendTest(template)}
                      disabled={sending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? 'Sending...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Email Preview: {previewTemplate.name}
                <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject:</Label>
                <p className="font-medium">{previewTemplate.subject}</p>
              </div>
              <div>
                <Label>Content:</Label>
                <div 
                  className="border rounded p-4 bg-background"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Eye, Palette, Building, Layout, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

// Reuse the same table but with template_type = 'quote'
type InvoiceTemplate = Tables<'invoice_templates'>;

export const QuoteTemplateSettings = () => {
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: '',
    address: '',
    email: '',
    phone: '',
    website: ''
  });
  const [branding, setBranding] = useState({
    logo_url: '',
    primary_color: '#007bff',
    secondary_color: '#28a745',
    accent_color: '#007bff'
  });
  const [layoutSettings, setLayoutSettings] = useState({
    template_style: 'modern',
    show_company_logo: true,
    show_payment_terms: true,
    footer_text: 'We look forward to working with you!',
    currency_symbol: '£',
    date_format: 'DD/MM/YYYY'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('is_default', true)
        .eq('template_type', 'quote')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplate(data);
        setCompanyDetails((data.company_details as any) || companyDetails);
        setBranding((data.branding as any) || branding);
        setLayoutSettings((data.layout_settings as any) || layoutSettings);
      }
    } catch (error) {
      console.error('Error fetching quote template:', error);
      // not fatal if empty
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const templateData = {
        name: 'Default Quote Template',
        is_default: true,
        company_details: companyDetails as any,
        branding: branding as any,
        layout_settings: layoutSettings as any,
        template_type: 'quote' as const,
      };

      if (template) {
        const { error } = await supabase
          .from('invoice_templates')
          .update(templateData)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoice_templates')
          .insert([templateData]);
        if (error) throw error;
      }

      toast.success('Quote template saved');
      fetchTemplate();
    } catch (error) {
      console.error('Error saving quote template:', error);
      toast.error('Failed to save quote template');
    } finally {
      setSaving(false);
    }
  };

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Quote Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; background: white; }
            .header { border-bottom: 3px solid ${branding.primary_color}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .company-name { font-size: 28px; font-weight: bold; color: ${branding.primary_color}; margin-bottom: 10px; }
            .logo-placeholder { width: 120px; height: 60px; background: ${branding.logo_url ? 'transparent' : '#f0f0f0'}; border: ${branding.logo_url ? 'none' : '2px dashed #ccc'}; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999; }
            .title { font-size: 32px; font-weight: bold; margin: 30px 0; color: ${branding.accent_color}; }
            .details { background: linear-gradient(135deg, ${branding.primary_color}15, ${branding.secondary_color}15); padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${branding.primary_color}; }
            .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items-table th, .items-table td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
            .items-table th { background: ${branding.primary_color}; color: white; font-weight: bold; }
            .footer { margin-top: 50px; padding-top: 30px; border-top: 2px solid ${branding.primary_color}; text-align: center; color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company-name">${companyDetails.company_name}</div>
              <div class="company-details">${companyDetails.address}<br>${companyDetails.email}${companyDetails.phone ? '<br>' + companyDetails.phone : ''}${companyDetails.website ? '<br>' + companyDetails.website : ''}</div>
            </div>
            ${layoutSettings.show_company_logo ? `<div class="logo-placeholder">${branding.logo_url ? `<img src="${branding.logo_url}" alt="Logo" style="max-width: 120px; max-height: 60px;">` : 'Logo Placeholder'}</div>` : ''}
          </div>
          <div class="title">QUOTE</div>
          <div class="details">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Valid Until:</strong> ${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString()}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Proposed Services</td>
                <td>${layoutSettings.currency_symbol}1,250.00</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">${layoutSettings.footer_text}</div>
        </body>
      </html>
    `;
  };

  const handlePdfPreview = async () => {
    const sample = {
      invoice_number: 'QUO-001',
      customer_name: 'Prospect Name',
      customer_email: 'prospect@example.com',
      customer_company: 'Prospect Co',
      amount: 1250,
      created_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 14*24*60*60*1000).toISOString(),
      project_title: 'Proposed Services',
      status: 'draft'
    } as const;

    const blob = await generateInvoicePDF(sample as any, {
      company_details: companyDetails as any,
      branding: branding as any,
      layout_settings: layoutSettings as any
    });

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Template Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quote Template Preview</h2>
          <Button onClick={() => setShowPreview(false)} variant="outline">
            Back to Settings
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="min-h-[800px] w-full bg-white" dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quote Template Settings</h2>
          <p className="text-muted-foreground">Customize your quote template and branding</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowPreview(true)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handlePdfPreview} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            PDF Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" value={companyDetails.company_name} onChange={(e) => setCompanyDetails({ ...companyDetails, company_name: e.target.value })} placeholder="Your Company Name" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={companyDetails.address} onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })} placeholder="Company address" rows={3} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={companyDetails.email} onChange={(e) => setCompanyDetails({ ...companyDetails, email: e.target.value })} placeholder="contact@company.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={companyDetails.phone} onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })} placeholder="+44 123 456 7890" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={companyDetails.website} onChange={(e) => setCompanyDetails({ ...companyDetails, website: e.target.value })} placeholder="https://company.com" />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Branding & Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" value={branding.logo_url} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primary_color" type="color" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} placeholder="#007bff" />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input id="secondary_color" type="color" value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={branding.secondary_color} onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })} placeholder="#28a745" />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input id="accent_color" type="color" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="w-16 h-10 p-1" />
                <Input value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} placeholder="#007bff" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layout className="h-5 w-5 mr-2" />
            Layout Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template_style">Template Style</Label>
                <Select value={layoutSettings.template_style} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, template_style: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Select value={layoutSettings.currency_symbol} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, currency_symbol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="£">£ (GBP)</SelectItem>
                    <SelectItem value="$">$ (USD)</SelectItem>
                    <SelectItem value="€">€ (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_format">Date Format</Label>
                <Select value={layoutSettings.date_format} onValueChange={(value) => setLayoutSettings({ ...layoutSettings, date_format: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show_logo">Show Company Logo</Label>
                <Switch id="show_logo" checked={layoutSettings.show_company_logo} onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_company_logo: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show_terms">Show Terms Section</Label>
                <Switch id="show_terms" checked={layoutSettings.show_payment_terms} onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_payment_terms: checked })} />
              </div>

              <div>
                <Label htmlFor="footer_text">Footer Text</Label>
                <Textarea id="footer_text" value={layoutSettings.footer_text} onChange={(e) => setLayoutSettings({ ...layoutSettings, footer_text: e.target.value })} placeholder="We look forward to working with you!" rows={3} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Eye, Palette, Building, Layout, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

type InvoiceTemplate = Tables<'invoice_templates'>;

interface CompanyDetails {
  company_name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
}

interface Branding {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

interface LayoutSettings {
  template_style: string;
  show_company_logo: boolean;
  show_payment_terms: boolean;
  footer_text: string;
  currency_symbol: string;
  date_format: string;
}

export const InvoiceTemplateSettings = () => {
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    company_name: '',
    address: '',
    email: '',
    phone: '',
    website: ''
  });
  const [branding, setBranding] = useState<Branding>({
    logo_url: '',
    primary_color: '#007bff',
    secondary_color: '#28a745',
    accent_color: '#007bff'
  });
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    template_style: 'modern',
    show_company_logo: true,
    show_payment_terms: true,
    footer_text: 'Thank you for your business!',
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
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTemplate(data);
        setCompanyDetails((data.company_details as any) || {
          company_name: '',
          address: '',
          email: '',
          phone: '',
          website: ''
        });
        setBranding((data.branding as any) || {
          logo_url: '',
          primary_color: '#007bff',
          secondary_color: '#28a745',
          accent_color: '#007bff'
        });
        setLayoutSettings((data.layout_settings as any) || {
          template_style: 'modern',
          show_company_logo: true,
          show_payment_terms: true,
          footer_text: 'Thank you for your business!',
          currency_symbol: '£',
          date_format: 'DD/MM/YYYY'
        });
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const templateData = {
        name: 'Default Template',
        is_default: true,
        company_details: companyDetails as any,
        branding: branding as any,
        layout_settings: layoutSettings as any
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

      toast.success('Template settings saved successfully');
      fetchTemplate();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template settings');
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
          <title>Invoice Preview</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #333;
              background: white;
            }
            .header { 
              border-bottom: 3px solid ${branding.primary_color}; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .company-info {
              flex: 1;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: ${branding.primary_color}; 
              margin-bottom: 10px;
            }
            .company-details {
              color: #666;
              line-height: 1.5;
            }
            .logo-placeholder {
              width: 120px;
              height: 60px;
              background: ${branding.logo_url ? 'transparent' : '#f0f0f0'};
              border: ${branding.logo_url ? 'none' : '2px dashed #ccc'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #999;
            }
            .invoice-title { 
              font-size: 32px; 
              font-weight: bold; 
              margin: 30px 0;
              color: ${branding.accent_color};
            }
            .invoice-details { 
              background: linear-gradient(135deg, ${branding.primary_color}15, ${branding.secondary_color}15); 
              padding: 25px; 
              border-radius: 8px; 
              margin: 20px 0;
              border-left: 4px solid ${branding.primary_color};
            }
            .invoice-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .amount { 
              font-size: 28px; 
              font-weight: bold; 
              color: ${branding.secondary_color}; 
              text-align: right;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .items-table th,
            .items-table td {
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            .items-table th {
              background: ${branding.primary_color};
              color: white;
              font-weight: bold;
            }
            .total-section {
              background: ${branding.primary_color}10;
              padding: 20px;
              border-radius: 8px;
              text-align: right;
              margin: 30px 0;
            }
            .footer { 
              margin-top: 50px; 
              padding-top: 30px; 
              border-top: 2px solid ${branding.primary_color}; 
              text-align: center; 
              color: #666;
              font-style: italic;
            }
            .payment-terms {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <div class="company-name">${companyDetails.company_name}</div>
              <div class="company-details">
                ${companyDetails.address}<br>
                ${companyDetails.email}${companyDetails.phone ? '<br>' + companyDetails.phone : ''}
                ${companyDetails.website ? '<br>' + companyDetails.website : ''}
              </div>
            </div>
            ${layoutSettings.show_company_logo ? `
              <div class="logo-placeholder">
                ${branding.logo_url ? `<img src="${branding.logo_url}" alt="Logo" style="max-width: 120px; max-height: 60px;">` : 'Logo Placeholder'}
              </div>
            ` : ''}
          </div>
          
          <div class="invoice-title">INVOICE</div>
          
          <div class="invoice-details">
            <div class="invoice-meta">
              <div>
                <p><strong>Invoice Number:</strong> INV-001</p>
                <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Bill To:</strong></p>
                <p>Sample Customer<br>
                customer@example.com<br>
                Sample Company Ltd</p>
              </div>
            </div>
            <div class="amount">Total: ${layoutSettings.currency_symbol}1,250.00</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Web Development Services</td>
                <td>1</td>
                <td>${layoutSettings.currency_symbol}1,000.00</td>
                <td>${layoutSettings.currency_symbol}1,000.00</td>
              </tr>
              <tr>
                <td>Additional Features</td>
                <td>1</td>
                <td>${layoutSettings.currency_symbol}250.00</td>
                <td>${layoutSettings.currency_symbol}250.00</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <h3>Total Amount: ${layoutSettings.currency_symbol}1,250.00</h3>
          </div>

          ${layoutSettings.show_payment_terms ? `
            <div class="payment-terms">
              <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date. 
              Late payments may incur additional charges.
            </div>
          ` : ''}

          <div class="footer">
            <p>${layoutSettings.footer_text}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePdfPreview = async () => {
    const sampleInvoice = {
      invoice_number: 'INV-001',
      customer_name: 'Sample Customer',
      customer_email: 'customer@example.com',
      customer_company: 'Sample Company Ltd',
      amount: 1250,
      created_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      project_title: 'Web Development Services',
      status: 'pending'
    } as const;

    const blob = await generateInvoicePDF(sampleInvoice as any, {
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
          <CardTitle>Invoice Template Settings</CardTitle>
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
          <h2 className="text-2xl font-bold">Invoice Template Preview</h2>
          <Button onClick={() => setShowPreview(false)} variant="outline">
            Back to Settings
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div 
              className="min-h-[800px] w-full bg-white"
              dangerouslySetInnerHTML={{ __html: generatePreviewHTML() }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Template Settings</h2>
          <p className="text-muted-foreground">Customize your invoice template and branding</p>
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
              <Input
                id="company_name"
                value={companyDetails.company_name}
                onChange={(e) => setCompanyDetails({...companyDetails, company_name: e.target.value})}
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={companyDetails.address}
                onChange={(e) => setCompanyDetails({...companyDetails, address: e.target.value})}
                placeholder="Company address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={companyDetails.email}
                onChange={(e) => setCompanyDetails({...companyDetails, email: e.target.value})}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={companyDetails.phone}
                onChange={(e) => setCompanyDetails({...companyDetails, phone: e.target.value})}
                placeholder="+44 123 456 7890"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyDetails.website}
                onChange={(e) => setCompanyDetails({...companyDetails, website: e.target.value})}
                placeholder="https://company.com"
              />
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
              <Input
                id="logo_url"
                value={branding.logo_url}
                onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={branding.primary_color}
                  onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
                  placeholder="#007bff"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
                  placeholder="#28a745"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={branding.accent_color}
                  onChange={(e) => setBranding({...branding, accent_color: e.target.value})}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={branding.accent_color}
                  onChange={(e) => setBranding({...branding, accent_color: e.target.value})}
                  placeholder="#007bff"
                />
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
                <Select value={layoutSettings.template_style} onValueChange={(value) => setLayoutSettings({...layoutSettings, template_style: value})}>
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
                <Select value={layoutSettings.currency_symbol} onValueChange={(value) => setLayoutSettings({...layoutSettings, currency_symbol: value})}>
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
                <Select value={layoutSettings.date_format} onValueChange={(value) => setLayoutSettings({...layoutSettings, date_format: value})}>
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
                <Switch
                  id="show_logo"
                  checked={layoutSettings.show_company_logo}
                  onCheckedChange={(checked) => setLayoutSettings({...layoutSettings, show_company_logo: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show_terms">Show Payment Terms</Label>
                <Switch
                  id="show_terms"
                  checked={layoutSettings.show_payment_terms}
                  onCheckedChange={(checked) => setLayoutSettings({...layoutSettings, show_payment_terms: checked})}
                />
              </div>

              <div>
                <Label htmlFor="footer_text">Footer Text</Label>
                <Textarea
                  id="footer_text"
                  value={layoutSettings.footer_text}
                  onChange={(e) => setLayoutSettings({...layoutSettings, footer_text: e.target.value})}
                  placeholder="Thank you for your business!"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
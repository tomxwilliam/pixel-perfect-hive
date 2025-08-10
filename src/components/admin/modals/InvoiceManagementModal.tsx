import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Download, Send, Eye, FileText, User, Calendar, DollarSign, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF, generateSimpleInvoicePDF } from '@/utils/pdfGenerator';

type Invoice = Tables<'invoices'>;
type Profile = Tables<'profiles'>;

interface InvoiceWithCustomer extends Invoice {
  customer: Profile;
  project?: { title: string };
}

interface InvoiceManagementModalProps {
  invoice: InvoiceWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated: () => void;
}

export const InvoiceManagementModal: React.FC<InvoiceManagementModalProps> = ({
  invoice,
  open,
  onOpenChange,
  onInvoiceUpdated
}) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDownloadInvoice = async () => {
    setLoading(true);
    try {
      // Fetch template settings
      const { data: template } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      const invoiceData = {
        invoice_number: invoice.invoice_number,
        customer_name: `${invoice.customer.first_name} ${invoice.customer.last_name}`,
        customer_email: invoice.customer.email,
        customer_company: invoice.customer.company_name || undefined,
        amount: Number(invoice.amount),
        due_date: invoice.due_date || undefined,
        created_date: invoice.created_at,
        project_title: invoice.project?.title,
        status: invoice.status,
        paid_at: invoice.paid_at || undefined
      };

      if (template) {
        // Use advanced PDF generation with template
        try {
          const pdfBlob = await generateInvoicePDF(invoiceData, {
            company_details: template.company_details as any,
            branding: template.branding as any,
            layout_settings: template.layout_settings as any
          });
          
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoice.invoice_number}.pdf`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (pdfError) {
          console.warn('Advanced PDF generation failed, using simple PDF:', pdfError);
          // Fallback to simple PDF generation
          const pdf = generateSimpleInvoicePDF(invoiceData, {
            company_details: template.company_details as any,
            branding: template.branding as any,
            layout_settings: template.layout_settings as any
          });
          pdf.save(`invoice-${invoice.invoice_number}.pdf`);
        }
      } else {
        // Fallback to simple PDF with default template
        const defaultTemplate = {
          company_details: {
            company_name: '404 Code Lab',
            address: 'Professional Development Services',
            email: 'contact@404codelab.com',
            phone: '',
            website: 'https://404codelab.com'
          },
          branding: {
            logo_url: '',
            primary_color: '#007bff',
            secondary_color: '#28a745',
            accent_color: '#007bff'
          },
          layout_settings: {
            template_style: 'modern',
            show_company_logo: true,
            show_payment_terms: true,
            footer_text: 'Thank you for your business!',
            currency_symbol: '£',
            date_format: 'DD/MM/YYYY'
          }
        };
        
        const pdf = generateSimpleInvoicePDF(invoiceData, defaultTemplate);
        pdf.save(`invoice-${invoice.invoice_number}.pdf`);
      }

      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    setLoading(true);
    try {
      // Call the edge function to send invoice email
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          invoice_id: invoice.id,
          customer_email: invoice.customer.email,
          customer_name: `${invoice.customer.first_name} ${invoice.customer.last_name}`,
          invoice_number: invoice.invoice_number,
          amount: invoice.amount,
          due_date: invoice.due_date
        }
      });

      if (error) throw error;

      toast.success('Invoice sent successfully');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice. Please check edge function configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoice.id);

      if (error) throw error;

      // Send notification to customer about payment received
      try {
        await supabase.functions.invoke('admin-notifications', {
          body: {
            action: 'send_status_change_notification',
            data: {
              user_id: invoice.customer_id,
              entity_type: 'invoice',
              entity_id: invoice.id,
              old_status: invoice.status,
              new_status: 'paid',
              entity_title: `Invoice ${invoice.invoice_number}`,
              created_by: null // Will be set by the edge function
            }
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the main operation if notification fails
      }

      toast.success('Invoice marked as paid');
      onInvoiceUpdated();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Invoice Details
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{invoice.customer.first_name} {invoice.customer.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{invoice.customer.email}</span>
                    </div>
                    {invoice.customer.company_name && (
                      <p className="text-sm text-muted-foreground ml-6">{invoice.customer.company_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Project</label>
                    <p className="text-sm mt-1">{invoice.project?.title || 'General Services'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">£{Number(invoice.amount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm mt-1">{new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>

                  {invoice.paid_at && (
                    <div>
                      <label className="text-sm font-medium">Paid Date</label>
                      <p className="text-sm mt-1">{new Date(invoice.paid_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium">Stripe Payment Intent</label>
                  <p className="mt-1 font-mono text-muted-foreground break-all">
                    {invoice.stripe_payment_intent_id || '—'}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Tide Payment Status</label>
                  <p className="mt-1 text-muted-foreground">{invoice.tide_payment_status || '—'}</p>
                </div>
                <div>
                  <label className="font-medium">Tide Payment Link</label>
                  {invoice.tide_payment_link_url ? (
                    <a
                      href={invoice.tide_payment_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block underline text-primary"
                    >
                      Open payment link
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground">—</p>
                  )}
                </div>
                <div>
                  <label className="font-medium">Tide Request ID</label>
                  <p className="mt-1 font-mono text-muted-foreground break-all">
                    {invoice.tide_payment_request_id || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadInvoice}
                  disabled={loading}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  onClick={handleSendInvoice}
                  disabled={loading}
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Send to Customer'}
                </Button>

                {invoice.status === 'pending' && (
                  <Button
                    onClick={handleMarkAsPaid}
                    disabled={loading}
                    variant="default"
                  >
                    Mark as Paid
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
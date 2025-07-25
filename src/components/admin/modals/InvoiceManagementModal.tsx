import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Download, Send, Eye, FileText, User, Calendar, DollarSign, Mail } from 'lucide-react';
import { toast } from 'sonner';

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
      // Generate PDF content for the invoice
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        customer_name: `${invoice.customer.first_name} ${invoice.customer.last_name}`,
        customer_email: invoice.customer.email,
        customer_company: invoice.customer.company_name,
        amount: invoice.amount,
        due_date: invoice.due_date,
        created_date: invoice.created_at,
        project_title: invoice.project?.title,
        status: invoice.status
      };

      // Create a simple HTML invoice for download
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 30px; }
            .customer-details { margin-bottom: 30px; }
            .amount-section { background: #f5f5f5; padding: 20px; margin: 20px 0; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${invoice.invoice_number}</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}</p>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          </div>

          <div class="customer-details">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customer_name}</strong></p>
            <p>${invoice.customer.email}</p>
            ${invoice.customer.company_name ? `<p>${invoice.customer.company_name}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.project?.title || 'Professional Services'}</td>
                <td>£${Number(invoice.amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="amount-section">
            <h2>Total Amount: £${Number(invoice.amount).toLocaleString()}</h2>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Invoice downloaded successfully');
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
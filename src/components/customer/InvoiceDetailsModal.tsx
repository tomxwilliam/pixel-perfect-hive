import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Calendar, Download, DollarSign, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { generateInvoicePDF, generateSimpleInvoicePDF } from '@/utils/pdfGenerator';

type Invoice = Tables<'invoices'>;

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceUpdated: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  open,
  onOpenChange,
  onInvoiceUpdated,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = React.useState(false);

  if (!invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handlePayInvoice = async () => {
    if (!user) return;
    
    setProcessingPayment(true);
    try {
      const response = await supabase.functions.invoke('process-payment', {
        body: { invoiceId: invoice.id }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
      }

      toast({
        title: "Payment Processing",
        description: "Redirecting to payment page...",
      });

      onInvoiceUpdated();
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const { data: template } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('is_default', true)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const invoiceData = {
        invoice_number: invoice.invoice_number,
        customer_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Customer',
        customer_email: profile?.email || user?.email || '',
        customer_company: profile?.company_name || undefined,
        amount: Number(invoice.amount),
        due_date: invoice.due_date || undefined,
        created_date: invoice.created_at,
        project_title: 'Professional Services',
        status: invoice.status,
        paid_at: invoice.paid_at || undefined
      };

      if (template) {
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
        } catch {
          const pdf = generateSimpleInvoicePDF(invoiceData, {
            company_details: template.company_details as any,
            branding: template.branding as any,
            layout_settings: template.layout_settings as any
          });
          pdf.save(`invoice-${invoice.invoice_number}.pdf`);
        }
      } else {
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

      toast({
        title: "Invoice Downloaded",
        description: "Invoice has been downloaded as PDF file.",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            Complete invoice information and payment options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    Invoice #{invoice.invoice_number}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Invoice ID: #{invoice.id.split('-')[0]}
                    </span>
                  </div>
                  {isOverdue && (
                    <div className="mt-2">
                      <Badge variant="destructive">
                        PAYMENT OVERDUE
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary flex items-center">
                    <DollarSign className="h-6 w-6 mr-1" />
                    £{Number(invoice.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Issued</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(invoice.created_at)}
                  </div>
                </div>
                
                {invoice.due_date && (
                  <div className={`text-center p-4 border rounded-lg ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                    <Clock className={`h-8 w-8 mx-auto mb-2 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
                    <div className="font-medium">Due Date</div>
                    <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {formatDate(invoice.due_date)}
                      {isOverdue && <div className="font-medium text-red-600 mt-1">OVERDUE</div>}
                    </div>
                  </div>
                )}

                {invoice.paid_at && (
                  <div className="text-center p-4 border rounded-lg border-green-200 bg-green-50">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">Paid Date</div>
                    <div className="text-sm text-green-600">
                      {formatDate(invoice.paid_at)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {invoice.stripe_payment_intent_id && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm">
                    <span className="font-medium">Payment ID:</span> {invoice.stripe_payment_intent_id}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Invoice Actions</h3>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={handleDownloadInvoice}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {invoice.status === 'pending' && (
                  <Button 
                    onClick={handlePayInvoice}
                    disabled={processingPayment}
                    className="flex-1"
                    variant={isOverdue ? "destructive" : "default"}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {processingPayment ? 'Processing...' : 'Pay Now'}
                  </Button>
                )}
              </div>
              {invoice.status === 'pending' && (
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Click "Pay Now" to make a secure payment through Stripe.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
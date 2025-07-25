
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Calendar, Download } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';

type Invoice = Tables<'invoices'>;

export const CustomerInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    // Real-time subscription
    const channel = supabase
      .channel('customer-invoices')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `customer_id=eq.${user?.id}` },
        () => fetchInvoices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
      case 'paid': return '✓';
      case 'pending': return '⏳';
      case 'overdue': return '⚠️';
      default: return '📄';
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    if (!user) return;
    
    setProcessingPayment(invoiceId);
    try {
      const response = await supabase.functions.invoke('process-payment', {
        body: { invoiceId }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Redirect to Stripe checkout
      if (response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
      }

      toast({
        title: "Payment Processing",
        description: "Redirecting to payment page...",
      });

    } catch (error) {
      console.error('Payment processing failed:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #007bff; }
            .invoice-title { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">404 Code Lab</div>
            <p>Professional Development Services</p>
          </div>
          
          <div class="invoice-title">INVOICE</div>
          
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Issue Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
            ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>` : ''}
            <div class="amount">Amount: £${Number(invoice.amount).toLocaleString()}</div>
            <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            ${invoice.paid_at ? `<p><strong>Paid Date:</strong> ${new Date(invoice.paid_at).toLocaleDateString()}</p>` : ''}
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>404 Code Lab - contact@404codelab.com</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoice_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Invoice Downloaded",
      description: "Invoice has been downloaded as HTML file.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Billing</CardTitle>
          <CardDescription>Loading your invoices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Invoices & Billing
        </CardTitle>
        <CardDescription>
          View your payment history and outstanding invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} mb-6`}>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>£{totalPaid.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Paid</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-orange-600`}>£{pendingAmount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-start justify-between'} mb-2`}>
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {getStatusIcon(invoice.status)} Invoice #{invoice.invoice_number}
                    </h4>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-primary`}>
                      £{Number(invoice.amount).toLocaleString()}
                    </p>
                    {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === 'pending' && (
                      <p className="text-sm text-destructive font-medium">
                        Payment overdue
                      </p>
                    )}
                  </div>
                  <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col items-end'} gap-2`}>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                    <div className={`flex ${isMobile ? 'flex-col gap-1' : 'flex-col gap-2'}`}>
                      {invoice.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant={invoice.due_date && new Date(invoice.due_date) < new Date() ? "destructive" : "outline"} 
                          className={isMobile ? "text-xs px-2 h-7" : ""}
                          onClick={() => handlePayInvoice(invoice.id)}
                          disabled={processingPayment === invoice.id}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          {processingPayment === invoice.id ? 'Processing...' : (isMobile ? 'Pay' : 'Pay Now')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={isMobile ? "text-xs px-2 h-7" : ""}
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {isMobile ? 'DL' : 'Download'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex items-center justify-between'} text-sm text-muted-foreground`}>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Issued: {new Date(invoice.created_at).toLocaleDateString()}
                  </div>
                  {invoice.due_date && (
                    <div>
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                  )}
                  {invoice.paid_at && (
                    <div>
                      Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

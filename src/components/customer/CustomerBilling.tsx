import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, ExternalLink, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const CustomerBilling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Fetch customer invoices
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['customer-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch payment history (activity log)
  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('action', 'payment_completed')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (invoicesLoading || historyLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Payments</CardTitle>
          <CardDescription>Loading billing information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Payments
          </CardTitle>
          <CardDescription>
            Manage your invoices, payments, and billing history
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          {invoices?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground text-center">
                  Your invoices will appear here when you place orders
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Invoices</CardTitle>
                <CardDescription>All your invoices and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                          <br />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(invoice.created_at), 'PPP')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">£{invoice.amount}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.due_date ? format(new Date(invoice.due_date), 'PPP') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {invoice.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handlePayInvoice(invoice.id)}
                                disabled={processingPayment === invoice.id}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                {processingPayment === invoice.id ? 'Processing...' : 'Pay Now'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement invoice download
                                toast({
                                  title: "Download Invoice",
                                  description: "Invoice download will be implemented soon.",
                                });
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {paymentHistory?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No payment history</h3>
                <p className="text-muted-foreground text-center">
                  Your payment history will appear here after you make payments
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All your completed payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.created_at), 'PPP')}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{payment.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.entity_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerBilling;
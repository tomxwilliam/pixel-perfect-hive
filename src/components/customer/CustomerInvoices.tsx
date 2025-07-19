
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Calendar, Download } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

export const CustomerInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">£{totalPaid.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Paid</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">£{pendingAmount.toLocaleString()}</div>
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
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {getStatusIcon(invoice.status)} Invoice #{invoice.invoice_number}
                    </h4>
                    <p className="text-2xl font-bold text-primary">
                      £{Number(invoice.amount).toLocaleString()}
                    </p>
                    {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === 'pending' && (
                      <p className="text-sm text-destructive font-medium">
                        Payment overdue
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                    {invoice.status === 'pending' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    )}
                    {invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === 'pending' && (
                      <Button size="sm" variant="destructive">
                        <Download className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
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

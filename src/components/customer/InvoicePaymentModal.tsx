import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CreditCard, MessageSquare, Banknote } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

interface OrgBillingSettings {
  account_name: string;
  sort_code: string;
  account_number: string;
  iban: string | null;
  notes_bacs: string | null;
}

interface InvoicePaymentModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({
  invoice,
  open,
  onOpenChange
}) => {
  const [billingSettings, setBillingSettings] = useState<OrgBillingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchBillingSettings();
    }
  }, [open]);

  const fetchBillingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('org_billing_settings')
        .select('account_name, sort_code, account_number, iban, notes_bacs')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setBillingSettings(data);
    } catch (error) {
      console.error('Error fetching billing settings:', error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const createSupportTicket = async (reason: string) => {
    if (!invoice) return;

    setCreatingTicket(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          customer_id: invoice.customer_id,
          title: `Payment Assistance - Invoice #${invoice.invoice_number}`,
          description: `Customer requesting ${reason} for invoice #${invoice.invoice_number} (Amount: £${Number(invoice.amount).toLocaleString()})`,
          priority: 'medium',
          category_id: null,
          source: 'web'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Support Ticket Created",
        description: `Ticket #${data.ticket_number} has been created. We'll get back to you shortly.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Ticket Creation Failed",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingTicket(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay Invoice #{invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">£{Number(invoice.amount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not specified'}
              </p>
            </div>
            <Badge variant={invoice.status === 'pending' && invoice.due_date && new Date(invoice.due_date) < new Date() ? 'destructive' : 'secondary'}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="bacs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bacs" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Bank Transfer (BACS)
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card / Apple Pay / Google Pay
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bacs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : billingSettings ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Name</Label>
                        <div className="flex items-center gap-2">
                          <Input value={billingSettings.account_name} readOnly />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(billingSettings.account_name, 'Account name')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Sort Code</Label>
                        <div className="flex items-center gap-2">
                          <Input value={billingSettings.sort_code} readOnly />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(billingSettings.sort_code, 'Sort code')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <div className="flex items-center gap-2">
                          <Input value={billingSettings.account_number} readOnly />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(billingSettings.account_number, 'Account number')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {billingSettings.iban && (
                        <div className="space-y-2">
                          <Label>IBAN</Label>
                          <div className="flex items-center gap-2">
                            <Input value={billingSettings.iban} readOnly />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(billingSettings.iban!, 'IBAN')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Reference</Label>
                      <div className="flex items-center gap-2">
                        <Input value={invoice.invoice_number} readOnly className="font-mono" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(invoice.invoice_number, 'Invoice reference')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Please use this as your payment reference
                      </p>
                    </div>

                    {billingSettings.notes_bacs && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm">{billingSettings.notes_bacs}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Bank transfer details are not available at the moment.</p>
                    <p>Please contact support for assistance.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="card" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <CreditCard className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Prefer to pay by card, Apple Pay or Google Pay?</p>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a secure payment link via email
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => createSupportTicket('a secure payment link')}
                      disabled={creatingTicket}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {creatingTicket ? 'Creating Request...' : 'Contact Support for Payment Link'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => createSupportTicket('general payment assistance')}
                      disabled={creatingTicket}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open Support Ticket
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
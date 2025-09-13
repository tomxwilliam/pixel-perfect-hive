import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, CreditCard, Building2, Phone, Ticket } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

interface BillingSettings {
  id: string;
  account_name: string;
  sort_code: string;
  account_number: string;
  iban: string;
  notes_bacs: string;
}

interface InvoicePaymentModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoicePaymentModal: React.FC<InvoicePaymentModalProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && invoice) {
      fetchBillingSettings();
    }
  }, [open, invoice]);

  const fetchBillingSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('org_billing_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

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
    if (!user || !invoice) return;

    setCreatingTicket(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          customer_id: user.id,
          title: `Payment assistance for Invoice #${invoice.invoice_number}`,
          description: `Customer requesting ${reason} for invoice #${invoice.invoice_number} (Amount: £${invoice.amount})`,
          priority: 'medium',
          source: 'web',
          tags: ['payment', 'invoice', reason.includes('payment link') ? 'payment_link' : 'support']
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Support Ticket Created",
        description: `Ticket #${data.ticket_number} has been created. Our team will contact you shortly.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Failed to Create Ticket",
        description: "Please try again or contact support directly",
        variant: "destructive",
      });
    } finally {
      setCreatingTicket(false);
    }
  };

  if (!invoice) return null;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-[95vw]' : 'max-w-2xl'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay Invoice #{invoice.invoice_number}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{formatAmount(Number(invoice.amount))}</span>
            <Badge variant={invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === 'pending' ? 'destructive' : 'secondary'}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bank">Bank Transfer (BACS)</TabsTrigger>
            <TabsTrigger value="card">Card / Digital Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded"></div>
                ))}
              </div>
            ) : billingSettings ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Transfer Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Name:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{billingSettings.account_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(billingSettings.account_name, 'Account name')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sort Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{billingSettings.sort_code}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(billingSettings.sort_code, 'Sort code')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{billingSettings.account_number}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(billingSettings.account_number, 'Account number')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {billingSettings.iban && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">IBAN:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{billingSettings.iban}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(billingSettings.iban, 'IBAN')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Payment Reference (Important!)</h5>
                  <div className="flex items-center justify-between bg-background border rounded p-3">
                    <span className="font-mono font-bold text-lg">{invoice.invoice_number}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(invoice.invoice_number, 'Invoice reference')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please use this exact reference when making your payment
                  </p>
                </div>

                {billingSettings.notes_bacs && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">{billingSettings.notes_bacs}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Bank transfer details are not available. Please contact support.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="card" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h4 className="font-semibold mb-2">Prefer to pay by card, Apple Pay or Google Pay?</h4>
                <p className="text-muted-foreground mb-6">
                  We can provide you with a secure payment link for card and digital wallet payments.
                </p>
              </div>
              
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4 justify-center'}`}>
                <Button
                  onClick={() => createSupportTicket('payment link request')}
                  disabled={creatingTicket}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {creatingTicket ? 'Creating...' : 'Contact Support for Payment Link'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => createSupportTicket('general payment support')}
                  disabled={creatingTicket}
                  className="flex items-center gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  Open Support Ticket
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
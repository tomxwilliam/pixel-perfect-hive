import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { FileText, User, Calendar, DollarSign, Mail, Send, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  project_id: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  valid_until: string | null;
  description: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string | null;
}

interface Project {
  id: string;
  title: string;
}

interface QuoteWithCustomer extends Quote {
  customer: Profile;
  project: Project | null;
}

interface QuoteManagementModalProps {
  quote: QuoteWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteUpdated: () => void;
}

export const QuoteManagementModal: React.FC<QuoteManagementModalProps> = ({
  quote,
  open,
  onOpenChange,
  onQuoteUpdated
}) => {
  const [newStatus, setNewStatus] = useState(quote.status);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quote.id);

      if (error) throw error;

      // Send notification to customer about status change
      if (newStatus !== quote.status) {
        try {
          await supabase.functions.invoke('admin-notifications', {
            body: {
              action: 'send_status_change_notification',
              data: {
                user_id: quote.customer_id,
                entity_type: 'quote',
                entity_id: quote.id,
                old_status: quote.status,
                new_status: newStatus,
                entity_title: `Quote ${quote.quote_number}`,
                created_by: null // Will be set by the edge function
              }
            }
          });
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Don't fail the main operation if notification fails
        }
      }

      toast.success('Quote status updated successfully');
      onQuoteUpdated();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote status');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (quote.status !== 'accepted') {
      toast.error('Only accepted quotes can be converted to invoices');
      return;
    }

    setLoading(true);
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: quote.customer_id,
          project_id: quote.project_id,
          amount: quote.amount,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
        });

      if (invoiceError) throw invoiceError;

      // Update quote status to converted
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      toast.success('Quote converted to invoice successfully');
      onQuoteUpdated();
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      toast.error('Failed to convert quote to invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    setLoading(true);
    try {
      // Call the edge function to send quote email
      const { error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          customer_email: quote.customer.email,
          customer_name: `${quote.customer.first_name} ${quote.customer.last_name}`,
          invoice_number: quote.quote_number,
          amount: quote.amount,
          due_date: quote.valid_until,
          invoiceType: 'quote'
        }
      });

      if (error) throw error;

      toast.success('Quote sent to customer successfully');
    } catch (error) {
      console.error('Error sending quote:', error);
      toast.error('Failed to send quote. Please check edge function configuration.');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote {quote.quote_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Quote Details
                <div className="flex gap-2">
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status.toUpperCase()}
                  </Badge>
                  {isExpired && (
                    <Badge variant="destructive">
                      EXPIRED
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{quote.customer.first_name} {quote.customer.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{quote.customer.email}</span>
                    </div>
                    {quote.customer.company_name && (
                      <p className="text-sm text-muted-foreground ml-6">{quote.customer.company_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Project</label>
                    <p className="text-sm mt-1">{quote.project?.title || 'No Project Specified'}</p>
                  </div>

                  {quote.description && (
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-sm mt-1 text-muted-foreground">{quote.description}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Quote Amount</label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">£{quote.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry date'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm mt-1">{new Date(quote.created_at).toLocaleDateString()}</p>
                  </div>

                  {quote.due_date && (
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <p className="text-sm mt-1">{new Date(quote.due_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={loading || newStatus === quote.status}
                  size="sm"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </Button>
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
                  onClick={handleSendQuote}
                  disabled={loading}
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Customer
                </Button>

                {quote.status === 'accepted' && (
                  <Button
                    onClick={handleConvertToInvoice}
                    disabled={loading}
                    variant="default"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Convert to Invoice
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
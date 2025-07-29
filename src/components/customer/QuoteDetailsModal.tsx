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
import { FileText, Calendar, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Quote = Tables<'quotes'>;

interface QuoteDetailsModalProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuoteUpdated: () => void;
}

export const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({
  quote,
  open,
  onOpenChange,
  onQuoteUpdated,
}) => {
  const { toast } = useToast();

  if (!quote) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'expired': return 'outline';
      case 'converted': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'converted': return <FileText className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleQuoteAction = async (action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', quote.id);

      if (error) throw error;

      toast({
        title: `Quote ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
        description: `You have ${action === 'accept' ? 'accepted' : 'rejected'} this quote.`,
      });

      onQuoteUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quote. Please try again.',
        variant: 'destructive',
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

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Details
          </DialogTitle>
          <DialogDescription>
            Review the complete quote information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {getStatusIcon(quote.status)}
                    Quote #{quote.quote_number}
                  </h2>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Quote ID: #{quote.id.split('-')[0]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary flex items-center">
                    <DollarSign className="h-6 w-6 mr-1" />
                    £{Number(quote.amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>

              {/* Description */}
              {quote.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {quote.description}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Important Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(quote.created_at)}
                  </div>
                </div>
                
                {quote.valid_until && (
                  <div className={`text-center p-4 border rounded-lg ${isExpired ? 'border-red-200 bg-red-50' : ''}`}>
                    <Clock className={`h-8 w-8 mx-auto mb-2 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
                    <div className="font-medium">Valid Until</div>
                    <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {formatDate(quote.valid_until)}
                      {isExpired && <div className="font-medium text-red-600 mt-1">EXPIRED</div>}
                    </div>
                  </div>
                )}

                {quote.due_date && (
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="font-medium">Due Date</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(quote.due_date)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {quote.status === 'pending' && !isExpired && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quote Actions</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleQuoteAction('reject')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Quote
                  </Button>
                  <Button 
                    onClick={() => handleQuoteAction('accept')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Quote
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  By accepting this quote, you agree to proceed with the project at the quoted price.
                </p>
              </CardContent>
            </Card>
          )}

          {isExpired && quote.status === 'pending' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <h3 className="font-medium text-red-600">Quote Expired</h3>
                  <p className="text-sm mt-1">
                    This quote has expired. Please contact us for an updated quote.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
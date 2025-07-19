
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

export const CustomerQuotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Real-time subscription
    const channel = supabase
      .channel('customer-quotes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quotes', filter: `customer_id=eq.${user?.id}` },
        () => fetchQuotes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleQuoteAction = async (quoteId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', quoteId);

      if (error) throw error;
      fetchQuotes(); // Refresh the list
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>Loading your quotes...</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Project Quotes
        </CardTitle>
        <CardDescription>
          Review and respond to project proposals
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No quotes available</p>
            <p className="text-sm">Request a project quote to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div key={quote.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold flex items-center">
                        {getStatusIcon(quote.status)}
                        <span className="ml-2">Quote #{quote.quote_number}</span>
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        #{quote.id.split('-')[0]}
                      </span>
                    </div>
                    {quote.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {quote.description}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-primary mt-2">
                      £{Number(quote.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(quote.status)}>
                      {quote.status.toUpperCase()}
                    </Badge>
                    {quote.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuoteAction(quote.id, 'reject')}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleQuoteAction(quote.id, 'accept')}
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created: {new Date(quote.created_at).toLocaleDateString()}
                  </div>
                  {quote.valid_until && (
                    <div className={`${new Date(quote.valid_until) < new Date() ? 'text-red-500' : ''}`}>
                      Valid until: {new Date(quote.valid_until).toLocaleDateString()}
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

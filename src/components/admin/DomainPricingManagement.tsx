import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DomainPricing {
  id: string;
  tld: string;
  category: string;
  reg_1y_gbp: number | null;
  reg_2y_gbp: number | null;
  reg_5y_gbp: number | null;
  reg_10y_gbp: number | null;
  renew_1y_gbp: number | null;
  transfer_1y_gbp: number | null;
  reg_1y_usd: number | null;
  reg_2y_usd: number | null;
  reg_5y_usd: number | null;
  reg_10y_usd: number | null;
  renew_1y_usd: number | null;
  transfer_1y_usd: number | null;
  usd_to_gbp_rate: number;
  source: string;
  updated_at: string;
}

export function DomainPricingManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [percentage, setPercentage] = useState('');
  const queryClient = useQueryClient();

  // Fetch domain pricing data
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['domain-tld-pricing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domain_tld_pricing')
        .select('*')
        .order('tld');
      
      if (error) throw error;
      return data as DomainPricing[];
    }
  });

  const formatPrice = (price: number | null) => {
    return price ? `£${price.toFixed(2)}` : '-';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gTLD': return 'bg-blue-100 text-blue-800';
      case 'ccTLD': return 'bg-green-100 text-green-800';
      case 'sTLD': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'enom_api': return 'bg-primary/10 text-primary';
      case 'manual': return 'bg-orange-100 text-orange-800';
      case 'csv_upload': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const bulkUpdateMutation = useMutation({
    mutationFn: async (percentageChange: number) => {
      if (!pricingData) return;

      const multiplier = 1 + (percentageChange / 100);
      
      const updates = pricingData.map(async (row) => {
        const updatedData = {
          reg_1y_gbp: row.reg_1y_gbp ? Number((row.reg_1y_gbp * multiplier).toFixed(2)) : null,
          reg_2y_gbp: row.reg_2y_gbp ? Number((row.reg_2y_gbp * multiplier).toFixed(2)) : null,
          reg_5y_gbp: row.reg_5y_gbp ? Number((row.reg_5y_gbp * multiplier).toFixed(2)) : null,
          reg_10y_gbp: row.reg_10y_gbp ? Number((row.reg_10y_gbp * multiplier).toFixed(2)) : null,
          renew_1y_gbp: row.renew_1y_gbp ? Number((row.renew_1y_gbp * multiplier).toFixed(2)) : null,
          transfer_1y_gbp: row.transfer_1y_gbp ? Number((row.transfer_1y_gbp * multiplier).toFixed(2)) : null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('domain_tld_pricing')
          .update(updatedData)
          .eq('id', row.id);

        if (error) throw error;
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain-tld-pricing'] });
      toast.success('Pricing updated successfully');
      setIsDialogOpen(false);
      setPercentage('');
    },
    onError: (error) => {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    },
  });

  const handleBulkUpdate = () => {
    const percentageValue = parseFloat(percentage);
    
    if (isNaN(percentageValue)) {
      toast.error('Please enter a valid percentage');
      return;
    }

    if (percentageValue < -100 || percentageValue > 1000) {
      toast.error('Percentage must be between -100 and 1000');
      return;
    }

    bulkUpdateMutation.mutate(percentageValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domain Pricing Management</CardTitle>
              <CardDescription>
                Manage domain TLD pricing from eNom API with USD to GBP conversion
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Percent className="h-4 w-4" />
              Bulk Adjust Pricing
            </Button>
          </div>
        </CardHeader>
        <CardContent>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TLD</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reg 1Y</TableHead>
                  <TableHead>Reg 2Y</TableHead>
                  <TableHead>Reg 5Y</TableHead>
                  <TableHead>Reg 10Y</TableHead>
                  <TableHead>Renew 1Y</TableHead>
                  <TableHead>Transfer 1Y</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingData?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.tld}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(row.category)}>
                        {row.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.reg_1y_gbp)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.reg_2y_gbp)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.reg_5y_gbp)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.reg_10y_gbp)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.renew_1y_gbp)}
                    </TableCell>
                    <TableCell>
                      {formatPrice(row.transfer_1y_gbp)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSourceColor(row.source)}>
                        {row.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(row.updated_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">View Only</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {pricingData && pricingData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No domain pricing data found. Click "Sync from eNom" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Adjust Domain Pricing</DialogTitle>
            <DialogDescription>
              Apply a percentage adjustment to all domain prices. Enter a positive number to increase prices or a negative number to decrease them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage Change (%)</Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  placeholder="e.g., 10 for +10% or -5 for -5%"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="pr-8"
                  step="0.01"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                This will update all registration, renewal, and transfer prices by the specified percentage.
              </p>
            </div>

            {percentage && !isNaN(parseFloat(percentage)) && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Example:</p>
                <p className="text-sm text-muted-foreground">
                  A domain priced at £10.00 will become £{(10 * (1 + parseFloat(percentage) / 100)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setPercentage('');
              }}
              disabled={bulkUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={!percentage || bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Apply Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
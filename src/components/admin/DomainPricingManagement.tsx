import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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
          <CardTitle>Domain Pricing Management</CardTitle>
          <CardDescription>
            Manage domain TLD pricing from eNom API with USD to GBP conversion
          </CardDescription>
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
    </div>
  );
}
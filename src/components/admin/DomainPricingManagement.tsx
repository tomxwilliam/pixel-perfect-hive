import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Upload, RefreshCw, Edit2, Save, X } from 'lucide-react';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DomainPricing>>({});
  const [csvFile, setCsvFile] = useState<File | null>(null);

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

  // Sync from eNom mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-enom-domain-pricing', {
        method: 'POST'
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `${data.message}`,
      });
      queryClient.invalidateQueries({ queryKey: ['domain-tld-pricing'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update pricing mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<DomainPricing> }) => {
      const { error } = await supabase
        .from('domain_tld_pricing')
        .update({ ...data.updates, source: 'manual', updated_at: new Date().toISOString() })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Updated",
        description: "Pricing updated successfully",
      });
      setEditingRow(null);
      setEditData({});
      queryClient.invalidateQueries({ queryKey: ['domain-tld-pricing'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // CSV import mutation
  const csvImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          if (header.includes('usd') || header.includes('gbp')) {
            row[header] = value ? parseFloat(value) : null;
          } else {
            row[header] = value || null;
          }
        });
        return row;
      });

      // Convert USD to GBP and prepare for upsert
      const upsertData = data.map((row: any) => ({
        tld: row.tld,
        category: row.category || 'gTLD',
        reg_1y_gbp: row.reg_1y_usd ? Math.round(row.reg_1y_usd * 0.7397 * 100) / 100 : null,
        reg_2y_gbp: row.reg_2y_usd ? Math.round(row.reg_2y_usd * 0.7397 * 100) / 100 : null,
        reg_5y_gbp: row.reg_5y_usd ? Math.round(row.reg_5y_usd * 0.7397 * 100) / 100 : null,
        reg_10y_gbp: row.reg_10y_usd ? Math.round(row.reg_10y_usd * 0.7397 * 100) / 100 : null,
        renew_1y_gbp: row.renew_1y_usd ? Math.round(row.renew_1y_usd * 0.7397 * 100) / 100 : null,
        transfer_1y_gbp: row.transfer_1y_usd ? Math.round(row.transfer_1y_usd * 0.7397 * 100) / 100 : null,
        reg_1y_usd: row.reg_1y_usd,
        reg_2y_usd: row.reg_2y_usd,
        reg_5y_usd: row.reg_5y_usd,
        reg_10y_usd: row.reg_10y_usd,
        renew_1y_usd: row.renew_1y_usd,
        transfer_1y_usd: row.transfer_1y_usd,
        usd_to_gbp_rate: 0.7397,
        source: 'csv_upload',
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('domain_tld_pricing')
        .upsert(upsertData, { onConflict: 'tld' });
      
      if (error) throw error;
      return upsertData.length;
    },
    onSuccess: (count) => {
      toast({
        title: "CSV Import Complete",
        description: `Imported ${count} domain pricing records`,
      });
      setCsvFile(null);
      queryClient.invalidateQueries({ queryKey: ['domain-tld-pricing'] });
    },
    onError: (error) => {
      toast({
        title: "CSV Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleEdit = (row: DomainPricing) => {
    setEditingRow(row.id);
    setEditData(row);
  };

  const handleSave = () => {
    if (editingRow && editData) {
      updateMutation.mutate({
        id: editingRow,
        updates: editData
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleCsvImport = () => {
    if (csvFile) {
      csvImportMutation.mutate(csvFile);
    }
  };

  const exportToCsv = () => {
    if (!pricingData) return;
    
    const headers = [
      'tld', 'category', 'reg_1y_usd', 'reg_2y_usd', 'reg_5y_usd', 'reg_10y_usd',
      'renew_1y_usd', 'transfer_1y_usd', 'reg_1y_gbp', 'reg_2y_gbp', 'reg_5y_gbp',
      'reg_10y_gbp', 'renew_1y_gbp', 'transfer_1y_gbp', 'source', 'updated_at'
    ];
    
    const csvContent = [
      headers.join(','),
      ...pricingData.map(row => 
        headers.map(header => row[header as keyof DomainPricing] || '').join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain-pricing-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="flex flex-wrap gap-4 mb-4">
            <Button 
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync from eNom
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-auto"
              />
              <Button 
                onClick={handleCsvImport}
                disabled={!csvFile || csvImportMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                {csvImportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Import CSV
              </Button>
            </div>
            
            <Button 
              onClick={exportToCsv}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

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
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.reg_1y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            reg_1y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.reg_1y_gbp)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.reg_2y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            reg_2y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.reg_2y_gbp)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.reg_5y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            reg_5y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.reg_5y_gbp)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.reg_10y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            reg_10y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.reg_10y_gbp)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.renew_1y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            renew_1y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.renew_1y_gbp)
                      )}
                    </TableCell>
                    <TableCell>
                      {editingRow === row.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.transfer_1y_gbp || ''}
                          onChange={(e) => setEditData({
                            ...editData,
                            transfer_1y_gbp: parseFloat(e.target.value) || null
                          })}
                          className="w-20"
                        />
                      ) : (
                        formatPrice(row.transfer_1y_gbp)
                      )}
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
                      {editingRow === row.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(row)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
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
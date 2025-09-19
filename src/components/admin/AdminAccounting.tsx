import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StaticNavigation } from '@/components/StaticNavigation';
import { Footer } from '@/components/Footer';
import { CalendarIcon, Download, FileText, DollarSign, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExportOptions {
  startDate: Date | undefined;
  endDate: Date | undefined;
  format: 'csv' | 'excel';
  includeCustomers: boolean;
  includeProjects: boolean;
  includeTimeTracking: boolean;
}

export const AdminAccounting = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    startDate: undefined,
    endDate: undefined,
    format: 'csv',
    includeCustomers: true,
    includeProjects: true,
    includeTimeTracking: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleQuickDateRange = (range: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

    switch (range) {
      case 'this-month':
        setExportOptions(prev => ({ ...prev, startDate: startOfMonth, endDate: now }));
        break;
      case 'last-month':
        setExportOptions(prev => ({ ...prev, startDate: startOfLastMonth, endDate: endOfLastMonth }));
        break;
      case 'this-year':
        setExportOptions(prev => ({ ...prev, startDate: startOfYear, endDate: now }));
        break;
      case 'last-year':
        setExportOptions(prev => ({ ...prev, startDate: startOfLastYear, endDate: endOfLastYear }));
        break;
      case 'all-time':
        setExportOptions(prev => ({ ...prev, startDate: undefined, endDate: undefined }));
        break;
    }
  };

  const handleExport = async () => {
    if (!exportOptions.startDate && !exportOptions.endDate) {
      // All-time export is allowed
    } else if (!exportOptions.startDate || !exportOptions.endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates, or choose 'All Time'.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('export-accounting-data', {
        body: {
          startDate: exportOptions.startDate?.toISOString(),
          endDate: exportOptions.endDate?.toISOString(),
          format: exportOptions.format,
          includeCustomers: exportOptions.includeCustomers,
          includeProjects: exportOptions.includeProjects,
          includeTimeTracking: exportOptions.includeTimeTracking,
        },
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `accounting-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Accounting data exported successfully. ${data.recordCount} records included.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export accounting data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StaticNavigation />
      <div className="container mx-auto p-6 pt-28">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Export for Details</div>
                <p className="text-xs text-muted-foreground">
                  Full financial breakdown available in export
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Export for Details</div>
                <p className="text-xs text-muted-foreground">
                  Customer analysis in export data
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Export for Details</div>
                <p className="text-xs text-muted-foreground">
                  Unpaid invoices and quotes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accounting Data Export</CardTitle>
              <CardDescription>
                Export comprehensive financial data for your accountant including invoices, quotes, projects, domains, hosting, and time tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Date Range Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Date Ranges</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'this-month', label: 'This Month' },
                    { key: 'last-month', label: 'Last Month' },
                    { key: 'this-year', label: 'This Year' },
                    { key: 'last-year', label: 'Last Year' },
                    { key: 'all-time', label: 'All Time' },
                  ].map((range) => (
                    <Button
                      key={range.key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange(range.key)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !exportOptions.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportOptions.startDate ? format(exportOptions.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportOptions.startDate}
                        onSelect={(date) => setExportOptions(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !exportOptions.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportOptions.endDate ? format(exportOptions.endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportOptions.endDate}
                        onSelect={(date) => setExportOptions(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Export Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value: 'csv' | 'excel') => 
                    setExportOptions(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Recommended for Accountants)</SelectItem>
                    <SelectItem value="excel">Excel Compatible CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Include in Export</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCustomers}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeCustomers: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Customer Information</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeProjects}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeProjects: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Project Financial Data</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTimeTracking}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeTimeTracking: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Time Tracking & Billable Hours</span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Accounting Data
                  </>
                )}
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Export includes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All invoices with payment status and amounts</li>
                  <li>Quotes with conversion tracking</li>
                  <li>Project budgets and actual costs</li>
                  <li>Domain registration and renewal costs</li>
                  <li>Hosting subscription billing</li>
                  <li>Time logs with billable hour calculations</li>
                  <li>Customer details for cross-referencing</li>
                  <li>Outstanding receivables and recurring revenue</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};
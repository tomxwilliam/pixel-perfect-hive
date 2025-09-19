import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, CreditCard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BillingSettings {
  id: string;
  account_name: string;
  sort_code: string;
  account_number: string;
  iban: string;
  swift_code?: string; // Make optional for backward compatibility
  notes_bacs: string;
}

interface InvoiceSettingsProps {
  isSuperAdmin: boolean;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ isSuperAdmin }) => {
  const [settings, setSettings] = useState<BillingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('org_billing_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          account_name: '404 Code Lab Limited',
          sort_code: '00-00-00',
          account_number: '12345678',
          iban: '',
          swift_code: '',
          notes_bacs: 'Please use your invoice number as the payment reference when making your bank transfer. Payments are typically processed within 1-2 business days.'
        };
        setSettings(defaultSettings as BillingSettings);
      }
    } catch (error) {
      console.error('Error fetching billing settings:', error);
      toast({
        title: "Error",
        description: "Failed to load billing settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSortCode = (sortCode: string): boolean => {
    const regex = /^\d{2}-\d{2}-\d{2}$/;
    return regex.test(sortCode);
  };

  const validateAccountNumber = (accountNumber: string): boolean => {
    const regex = /^\d{8}$/;
    return regex.test(accountNumber);
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admin can edit billing settings",
        variant: "destructive",
      });
      return;
    }

    if (!settings) return;

    // Validation
    if (!validateSortCode(settings.sort_code)) {
      toast({
        title: "Invalid Sort Code",
        description: "Sort code must be in format 00-00-00",
        variant: "destructive",
      });
      return;
    }

    if (!validateAccountNumber(settings.account_number)) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be 8 digits",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('org_billing_settings')
        .upsert(settings, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast({
        title: "Settings Saved",
        description: "Bank details have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving billing settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save billing settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BillingSettings, value: string) => {
    if (!settings) return;

    // Format sort code automatically
    if (field === 'sort_code') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 6) {
        const formatted = cleaned.replace(/(\d{2})(\d{2})?(\d{2})?/, (match, p1, p2, p3) => {
          if (p3) return `${p1}-${p2}-${p3}`;
          if (p2) return `${p1}-${p2}`;
          return p1;
        });
        value = formatted;
      } else {
        return; // Don't update if too long
      }
    }

    // Limit account number to 8 digits
    if (field === 'account_number') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 8) {
        value = cleaned;
      } else {
        return;
      }
    }

    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoice Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Invoice Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load billing settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Transfer Details (BACS)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure bank details for invoice payments. These details will be shown to customers when they choose to pay by bank transfer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              value={settings.account_name}
              onChange={(e) => handleInputChange('account_name', e.target.value)}
              placeholder="e.g. Your Company Limited"
              disabled={!isSuperAdmin}
            />
          </div>

          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-4'}`}>
            <div className="space-y-2">
              <Label htmlFor="sort_code">Sort Code</Label>
              <Input
                id="sort_code"
                value={settings.sort_code}
                onChange={(e) => handleInputChange('sort_code', e.target.value)}
                placeholder="00-00-00"
                disabled={!isSuperAdmin}
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground">Format: 00-00-00</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={settings.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                placeholder="12345678"
                disabled={!isSuperAdmin}
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground">8 digits only</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN (Optional)</Label>
            <Input
              id="iban"
              value={settings.iban}
              onChange={(e) => handleInputChange('iban', e.target.value)}
              placeholder="GB00 BANK 0000 0000 0000 00"
              disabled={!isSuperAdmin}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swift_code">SWIFT/BIC Code (Optional)</Label>
            <Input
              id="swift_code"
              value={settings.swift_code || ''}
              onChange={(e) => handleInputChange('swift_code', e.target.value)}
              placeholder="BKENGB2L"
              disabled={!isSuperAdmin}
              maxLength={11}
            />
            <p className="text-xs text-muted-foreground">8 or 11 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes_bacs">Payment Instructions</Label>
            <Textarea
              id="notes_bacs"
              value={settings.notes_bacs}
              onChange={(e) => handleInputChange('notes_bacs', e.target.value)}
              placeholder="Additional instructions for bank transfer payments..."
              disabled={!isSuperAdmin}
              rows={4}
            />
          </div>

          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4'} pt-4`}>
            <Button
              onClick={handleSave}
              disabled={!isSuperAdmin || saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Customer View Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              This is how customers will see the bank details in their payment modal:
            </p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{settings.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sort Code:</span>
                  <span className="font-mono">{settings.sort_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono">{settings.account_number}</span>
                </div>
                {settings.iban && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBAN:</span>
                    <span className="font-mono">{settings.iban}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-primary/10 rounded border-l-4 border-primary">
                <p className="text-sm font-medium mb-1">Payment Reference:</p>
                <p className="font-mono text-sm">INV-2024-001 (Copy)</p>
              </div>
              
              {settings.notes_bacs && (
                <div className="mt-4 p-3 bg-muted/50 rounded">
                  <p className="text-sm">{settings.notes_bacs}</p>
                </div>
                )}
                {settings.swift_code && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SWIFT/BIC:</span>
                    <span className="font-mono">{settings.swift_code}</span>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
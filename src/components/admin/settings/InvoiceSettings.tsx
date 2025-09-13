import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Eye, Save } from 'lucide-react';

interface OrgBillingSettings {
  id: string;
  org_id: string;
  account_name: string;
  sort_code: string;
  account_number: string;
  iban: string | null;
  notes_bacs: string | null;
  created_at: string;
  updated_at: string;
}

interface InvoiceSettingsProps {
  isSuperAdmin: boolean;
}

export const InvoiceSettings: React.FC<InvoiceSettingsProps> = ({ isSuperAdmin }) => {
  const [settings, setSettings] = useState<OrgBillingSettings | null>(null);
  const [formData, setFormData] = useState({
    account_name: '',
    sort_code: '',
    account_number: '',
    iban: '',
    notes_bacs: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('org_billing_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setFormData({
          account_name: data.account_name,
          sort_code: data.sort_code,
          account_number: data.account_number,
          iban: data.iban || '',
          notes_bacs: data.notes_bacs || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can modify invoice settings",
        variant: "destructive",
      });
      return;
    }

    // Validate sort code format
    const sortCodeRegex = /^\d{2}-\d{2}-\d{2}$/;
    if (!sortCodeRegex.test(formData.sort_code)) {
      toast({
        title: "Invalid Format",
        description: "Sort code must be in format 00-00-00",
        variant: "destructive",
      });
      return;
    }

    // Validate account number (8 digits)
    if (!/^\d{8}$/.test(formData.account_number)) {
      toast({
        title: "Invalid Format",
        description: "Account number must be 8 digits",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('org_billing_settings')
          .update({
            account_name: formData.account_name,
            sort_code: formData.sort_code,
            account_number: formData.account_number,
            iban: formData.iban || null,
            notes_bacs: formData.notes_bacs || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('org_billing_settings')
          .insert({
            account_name: formData.account_name,
            sort_code: formData.sort_code,
            account_number: formData.account_number,
            iban: formData.iban || null,
            notes_bacs: formData.notes_bacs || null
          });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Invoice settings have been updated successfully",
      });

      fetchSettings(); // Refresh data
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save invoice settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    toast({
      title: "Bank Details Preview",
      description: `Account: ${formData.account_name}\nSort Code: ${formData.sort_code}\nAccount Number: ${formData.account_number}${formData.iban ? '\nIBAN: ' + formData.iban : ''}`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Invoice Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Invoice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Company Name Ltd"
                disabled={!isSuperAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_code">Sort Code</Label>
              <Input
                id="sort_code"
                value={formData.sort_code}
                onChange={(e) => setFormData({ ...formData, sort_code: e.target.value })}
                placeholder="00-00-00"
                maxLength={8}
                disabled={!isSuperAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="12345678"
                maxLength={8}
                disabled={!isSuperAdmin}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN (Optional)</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder="GB00 BANK 0000 0000 0000 00"
                disabled={!isSuperAdmin}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes_bacs">Bank Transfer Instructions</Label>
            <Textarea
              id="notes_bacs"
              value={formData.notes_bacs}
              onChange={(e) => setFormData({ ...formData, notes_bacs: e.target.value })}
              placeholder="Please use your invoice number as the payment reference..."
              rows={4}
              disabled={!isSuperAdmin}
            />
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        )}

        {!isSuperAdmin && (
          <div className="text-sm text-muted-foreground">
            You don't have permission to modify these settings.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
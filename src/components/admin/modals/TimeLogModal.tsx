import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Timer } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Ticket = Tables<'tickets'>;

interface TimeLogModalProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTimeLogged: () => void;
}

export const TimeLogModal: React.FC<TimeLogModalProps> = ({
  ticket,
  open,
  onOpenChange,
  onTimeLogged
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    hours_logged: '',
    description: '',
    billable: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const hours = parseFloat(formData.hours_logged);
    if (isNaN(hours) || hours <= 0) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a valid number of hours',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_time_logs')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          hours_logged: hours,
          description: formData.description || null,
          billable: formData.billable
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Time logged successfully' });
      onOpenChange(false);
      setFormData({
        hours_logged: '',
        description: '',
        billable: false
      });
      onTimeLogged();
    } catch (error: any) {
      console.error('Error logging time:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to log time',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Log Time - {ticket.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={formData.hours_logged}
              onChange={(e) => setFormData(prev => ({ ...prev, hours_logged: e.target.value }))}
              placeholder="e.g., 2.5"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter time in hours (minimum 0.25 hours / 15 minutes)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Work Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what you worked on..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="billable"
              checked={formData.billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
            />
            <Label htmlFor="billable">Billable Time</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
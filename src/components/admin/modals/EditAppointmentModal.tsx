import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Mail, Phone, Save, X, Link } from 'lucide-react';

interface CallBooking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
  meeting_link?: string;
  completed: boolean;
}

interface EditAppointmentModalProps {
  appointment: CallBooking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentUpdated: () => void;
}

export function EditAppointmentModal({ appointment, open, onOpenChange, onAppointmentUpdated }: EditAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: appointment.name,
    email: appointment.email,
    phone: appointment.phone || '',
    scheduled_at: new Date(appointment.scheduled_at).toISOString().slice(0, 16),
    duration_minutes: appointment.duration_minutes,
    notes: appointment.notes || '',
    meeting_link: appointment.meeting_link || '',
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('call_bookings')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration_minutes: formData.duration_minutes,
          notes: formData.notes || null,
          meeting_link: formData.meeting_link || null,
        })
        .eq('id', appointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      onAppointmentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Appointment
          </DialogTitle>
          <DialogDescription>
            Update appointment details and scheduling information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time
              </Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="240"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Meeting Link
            </Label>
            <Input
              id="meeting_link"
              type="url"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder="Enter meeting link (Zoom, Teams, etc.)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes or requirements"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
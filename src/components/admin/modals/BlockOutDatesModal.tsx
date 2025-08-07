import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BlockOutDatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDatesBlocked: () => void;
  existingBookings: Array<{ scheduled_at: string; name: string }>;
}

export const BlockOutDatesModal = ({ 
  open, 
  onOpenChange, 
  onDatesBlocked, 
  existingBookings 
}: BlockOutDatesModalProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string[]>([]);
  const { toast } = useToast();

  const checkForConflicts = (start: Date, end: Date) => {
    const conflicts: string[] = [];
    const startTime = start.getTime();
    const endTime = end.getTime();

    existingBookings.forEach(booking => {
      const bookingDate = new Date(booking.scheduled_at);
      const bookingTime = bookingDate.getTime();
      
      if (bookingTime >= startTime && bookingTime <= endTime) {
        conflicts.push(`${booking.name} on ${bookingDate.toLocaleDateString()}`);
      }
    });

    setConflictWarning(conflicts);
    return conflicts.length > 0;
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    if (start && end && start <= end) {
      checkForConflicts(start, end);
    } else {
      setConflictWarning([]);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate) {
      handleDateRangeChange(date, endDate);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (startDate && date) {
      handleDateRangeChange(startDate, date);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "Start date must be before or equal to end date",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create blocked dates for each day in the range
      const dates = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push({
          date: currentDate.toISOString().split('T')[0],
          reason: reason || 'Blocked by admin',
          is_full_day: true
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Insert all blocked dates
      const { error } = await supabase
        .from('blocked_dates')
        .insert(dates);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blocked ${dates.length} day(s) successfully`,
      });

      onDatesBlocked();
      onOpenChange(false);
      
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setConflictWarning([]);
    } catch (error) {
      console.error('Error blocking dates:', error);
      toast({
        title: "Error",
        description: "Failed to block dates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Block Out Dates</DialogTitle>
          <DialogDescription>
            Select dates to block from booking. Customers won't be able to book appointments during these dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => date < new Date() || (startDate && date < startDate)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              placeholder="e.g., Holiday, Personal leave, Office closed"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {conflictWarning.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> The following appointments conflict with these dates:
                <ul className="mt-1 list-disc list-inside text-sm">
                  {conflictWarning.map((conflict, index) => (
                    <li key={index}>{conflict}</li>
                  ))}
                </ul>
                Blocking these dates will not cancel existing appointments.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !startDate || !endDate}
            >
              {loading ? "Blocking..." : "Block Dates"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Settings,
  Plus,
  X,
  Save
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkingHours {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export const AvailabilitySettings = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      enabled: day !== 'Saturday' && day !== 'Sunday',
      startTime: '09:00',
      endTime: '17:00'
    }))
  );
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState('');
  const [isFullDayBlock, setIsFullDayBlock] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailabilitySettings();
  }, []);

  const fetchAvailabilitySettings = async () => {
    try {
      // Fetch working hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('setting_type', 'working_hours')
        .order('day_of_week');

      if (hoursData && !hoursError && hoursData.length > 0) {
        const updatedHours = workingHours.map((day, index) => {
          const setting = hoursData.find((h: any) => h.day_of_week === index);
          return setting ? {
            ...day,
            enabled: setting.is_available,
            startTime: setting.start_time.slice(0, 5), // Convert HH:MM:SS to HH:MM
            endTime: setting.end_time.slice(0, 5)
          } : day;
        });
        setWorkingHours(updatedHours);
      }

      // Fetch blocked dates
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (blockedData && !blockedError) {
        const mappedBlocked = blockedData.map((block: any) => ({
          id: block.id,
          date: block.date,
          reason: block.reason,
          isFullDay: block.is_full_day,
          startTime: block.start_time?.slice(0, 5),
          endTime: block.end_time?.slice(0, 5)
        }));
        setBlockedDates(mappedBlocked);
      }
    } catch (error) {
      console.error('Error fetching availability settings:', error);
    }
  };

  const saveWorkingHours = async () => {
    setLoading(true);
    try {
      // Delete existing settings
      await supabase
        .from('availability_settings')
        .delete()
        .eq('setting_type', 'working_hours');

      // Insert new settings
      const settingsToInsert = workingHours.map((day, index) => ({
        setting_type: 'working_hours',
        day_of_week: index,
        start_time: day.startTime + ':00',
        end_time: day.endTime + ':00',
        is_available: day.enabled,
      }));

      const { error } = await supabase
        .from('availability_settings')
        .insert(settingsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Working hours updated successfully",
      });
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast({
        title: "Error",
        description: "Failed to save working hours",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    const updated = [...workingHours];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setWorkingHours(updated);
  };

  const blockDate = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const newBlock = {
        date: selectedDate.toISOString().split('T')[0],
        reason: blockReason || null,
        is_full_day: isFullDayBlock,
        start_time: isFullDayBlock ? null : blockStartTime + ':00',
        end_time: isFullDayBlock ? null : blockEndTime + ':00',
      };

      const { error } = await supabase
        .from('blocked_dates')
        .insert(newBlock);

      if (error) throw error;

      fetchAvailabilitySettings();
      setShowBlockDialog(false);
      setSelectedDate(undefined);
      setBlockReason('');
      setIsFullDayBlock(true);

      toast({
        title: "Success",
        description: "Date blocked successfully",
      });
    } catch (error) {
      console.error('Error blocking date:', error);
      toast({
        title: "Error",
        description: "Failed to block date",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unblockDate = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setBlockedDates(blockedDates.filter(block => block.id !== blockId));
      toast({
        title: "Success",
        description: "Date unblocked successfully",
      });
    } catch (error) {
      console.error('Error unblocking date:', error);
      toast({
        title: "Error",
        description: "Failed to unblock date",
        variant: "destructive"
      });
    }
  };

  const isDateBlocked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.some(block => block.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Availability Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your working hours and blocked dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours
            </CardTitle>
            <CardDescription>Set your regular working schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workingHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex items-center space-x-2 min-w-[100px]">
                  <Switch
                    checked={hours.enabled}
                    onCheckedChange={(enabled) => updateWorkingHours(index, 'enabled', enabled)}
                  />
                  <Label className="text-sm font-medium">{hours.day}</Label>
                </div>
                
                {hours.enabled && (
                  <div className="flex items-center gap-2 flex-1">
                    <Select 
                      value={hours.startTime} 
                      onValueChange={(value) => updateWorkingHours(index, 'startTime', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">to</span>
                    <Select 
                      value={hours.endTime} 
                      onValueChange={(value) => updateWorkingHours(index, 'endTime', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
            
            <Button onClick={saveWorkingHours} disabled={loading} className="w-full mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Working Hours
            </Button>
          </CardContent>
        </Card>

        {/* Calendar & Blocked Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Block Dates
            </CardTitle>
            <CardDescription>Block specific dates or time slots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                blocked: (date) => isDateBlocked(date)
              }}
              modifiersStyles={{
                blocked: { 
                  backgroundColor: 'hsl(var(--destructive))',
                  color: 'white',
                  textDecoration: 'line-through'
                }
              }}
            />

            <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedDate}
                  onClick={() => selectedDate && setShowBlockDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Block Selected Date
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block Date</DialogTitle>
                  <DialogDescription>
                    Block {selectedDate?.toLocaleDateString()} from customer bookings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">Reason (optional)</Label>
                    <Input
                      id="reason"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g., Holiday, Meeting, etc."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isFullDayBlock}
                      onCheckedChange={setIsFullDayBlock}
                    />
                    <Label>Block entire day</Label>
                  </div>

                  {!isFullDayBlock && (
                    <div className="flex items-center gap-2">
                      <Select value={blockStartTime} onValueChange={setBlockStartTime}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm">to</span>
                      <Select value={blockEndTime} onValueChange={setBlockEndTime}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button onClick={blockDate} disabled={loading} className="w-full">
                    Block Date
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Blocked Dates List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <Label className="text-sm font-medium">Blocked Dates:</Label>
              {blockedDates.length > 0 ? (
                blockedDates.map((block) => (
                  <div key={block.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {new Date(block.date + 'T00:00:00').toLocaleDateString()}
                      </div>
                      {!block.isFullDay && (
                        <div className="text-xs text-muted-foreground">
                          {block.startTime} - {block.endTime}
                        </div>
                      )}
                      {block.reason && (
                        <div className="text-xs text-muted-foreground">{block.reason}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unblockDate(block.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No blocked dates</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

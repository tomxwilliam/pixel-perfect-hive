import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft
} from 'lucide-react';
import { format, addDays, isAfter, isBefore, startOfDay, setHours, setMinutes, addMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface AvailabilitySlot {
  date: Date;
  time: string;
  available: boolean;
}

interface BookingData {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
  created_at: string;
  completed: boolean;
}

const BookCall = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [existingBookings, setExistingBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: profile?.first_name && profile?.last_name 
      ? `${profile.first_name} ${profile.last_name}` 
      : '',
    email: user?.email || '',
    phone: profile?.phone || '',
    notes: ''
  });

  // Fetch availability settings and blocked dates
  const fetchAvailability = async (date: Date) => {
    try {
      setLoading(true);
      
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Get availability settings for this day
      const { data: settings } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      // Get blocked dates for this specific date
      const { data: blockedDates } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('date', format(date, 'yyyy-MM-dd'));

      // Get existing bookings for this date
      const startOfSelectedDate = startOfDay(date);
      const endOfSelectedDate = addDays(startOfSelectedDate, 1);
      
      const { data: bookings } = await supabase
        .from('call_bookings')
        .select('scheduled_at, duration_minutes')
        .gte('scheduled_at', startOfSelectedDate.toISOString())
        .lt('scheduled_at', endOfSelectedDate.toISOString());

      // Generate available time slots
      const slots: AvailabilitySlot[] = [];
      
      if (settings && settings.length > 0) {
        settings.forEach(setting => {
          const startTime = setting.start_time;
          const endTime = setting.end_time;
          
          // Parse time strings (assuming format "HH:MM:SS")
          const [startHour, startMin] = startTime.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          
          // Generate 30-minute slots
          let currentTime = setMinutes(setHours(date, startHour), startMin);
          const endTimeDate = setMinutes(setHours(date, endHour), endMin);
          
          while (isBefore(currentTime, endTimeDate)) {
            const timeString = format(currentTime, 'HH:mm');
            
            // Check if this slot is blocked
            const isBlocked = blockedDates?.some(blocked => {
              if (blocked.is_full_day) return true;
              
              if (blocked.start_time && blocked.end_time) {
                const blockStart = blocked.start_time;
                const blockEnd = blocked.end_time;
                return timeString >= blockStart && timeString < blockEnd;
              }
              
              return false;
            });

            // Check if this slot is already booked
            const isBooked = bookings?.some(booking => {
              const bookingTime = new Date(booking.scheduled_at);
              const bookingEnd = addMinutes(bookingTime, booking.duration_minutes);
              return currentTime >= bookingTime && currentTime < bookingEnd;
            });

            slots.push({
              date: currentTime,
              time: timeString,
              available: !isBlocked && !isBooked && isAfter(currentTime, new Date())
            });
            
            currentTime = addMinutes(currentTime, 30);
          }
        });
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's existing bookings
  const fetchExistingBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('call_bookings')
        .select('*')
        .eq('customer_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchExistingBookings();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a time slot.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDateTime = setMinutes(setHours(selectedDate, hours), minutes);
      
      const { error } = await supabase
        .from('call_bookings')
        .insert({
          customer_id: user?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          notes: formData.notes || null,
          scheduled_at: scheduledDateTime.toISOString(),
          duration_minutes: 30
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: `Your call is scheduled for ${format(scheduledDateTime, 'PPP')} at ${selectedTime}.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setFormData({ ...formData, notes: '' });
      
      // Refresh bookings
      fetchExistingBookings();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('call_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });

      fetchExistingBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Book a Call</h1>
              <p className="text-muted-foreground">
                Schedule a consultation call with our team
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Schedule New Call
                </CardTitle>
                <CardDescription>
                  Select a date and time that works for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label>Select Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < startOfDay(new Date())}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <Label>Available Times *</Label>
                      {loading ? (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              size="sm"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "text-sm",
                                !slot.available && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No available time slots for this date. Please select another date.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tell us what you'd like to discuss..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting || !selectedDate || !selectedTime}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Your Upcoming Calls
                </CardTitle>
                <CardDescription>
                  Manage your scheduled consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {existingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming calls scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {existingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium">
                                {format(new Date(booking.scheduled_at), 'PPP')}
                              </span>
                              <Badge variant="outline">
                                {format(new Date(booking.scheduled_at), 'p')}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {booking.duration_minutes} minutes
                              </div>
                              {booking.notes && (
                                <div className="flex items-start">
                                  <MessageSquare className="h-3 w-3 mr-1 mt-0.5" />
                                  <span>{booking.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelBooking(booking.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCall;

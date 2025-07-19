
import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Video, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AvailabilitySettings {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  setting_type: string;
}

interface BlockedDate {
  date: string;
  is_full_day: boolean;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

const BookCall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [callType, setCallType] = useState<string>('project_discovery');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const callTypes = [
    { 
      id: 'project_discovery', 
      name: 'Project Discovery', 
      duration: 30, 
      description: 'Discuss your project idea and requirements' 
    },
    { 
      id: 'technical_consultation', 
      name: 'Technical Consultation', 
      duration: 45, 
      description: 'Deep dive into technical architecture and solutions' 
    },
    { 
      id: 'project_review', 
      name: 'Project Review', 
      duration: 30, 
      description: 'Review progress and discuss next steps' 
    }
  ];

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableSlots();
    }
  }, [selectedDate, availabilitySettings, blockedDates]);

  const fetchAvailabilityData = async () => {
    try {
      // Fetch availability settings
      const { data: settings } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('setting_type', 'general');

      // Fetch blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('*');

      setAvailabilitySettings(settings || []);
      setBlockedDates(blocked || []);
    } catch (error) {
      console.error('Error fetching availability data:', error);
    }
  };

  const generateAvailableSlots = () => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // Check if date is blocked
    const isBlocked = blockedDates.some(blocked => 
      blocked.date === dateString && blocked.is_full_day
    );
    
    if (isBlocked) {
      setAvailableSlots([]);
      return;
    }

    // Find availability for this day of week
    const daySettings = availabilitySettings.find(setting => 
      setting.day_of_week === dayOfWeek && setting.is_available
    );

    if (!daySettings) {
      setAvailableSlots([]);
      return;
    }

    // Generate time slots (every 30 minutes)
    const slots: string[] = [];
    const startTime = new Date(`2000-01-01T${daySettings.start_time}`);
    const endTime = new Date(`2000-01-01T${daySettings.end_time}`);
    
    const currentSlot = new Date(startTime);
    while (currentSlot < endTime) {
      const timeString = currentSlot.toTimeString().slice(0, 5);
      slots.push(timeString);
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    setAvailableSlots(slots);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your call.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const selectedCallType = callTypes.find(type => type.id === callType);

      const { error } = await supabase
        .from('call_bookings')
        .insert({
          customer_id: user.id,
          name: `${user.email}`, // We'll get the actual name from profile
          email: user.email,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: selectedCallType?.duration || 30,
          notes: notes || `${selectedCallType?.name} - ${selectedCallType?.description}`,
          meeting_link: null, // To be set by admin
          completed: false
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: `Your ${selectedCallType?.name} is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}. We'll send you a meeting link shortly.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
      
    } catch (error) {
      console.error('Error booking call:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold">Book a Consultation Call</h1>
              <p className="text-muted-foreground">Schedule a call to discuss your project</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Call Types */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Call Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {callTypes.map((type) => (
                    <div 
                      key={type.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        callType === type.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCallType(type.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{type.name}</h4>
                        <Badge variant="secondary">{type.duration} min</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                      {callType === type.id && (
                        <CheckCircle className="h-4 w-4 text-primary mt-2" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Booking Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Schedule Your Call
                  </CardTitle>
                  <CardDescription>
                    Choose a convenient time for your consultation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBooking} className="space-y-6">
                    {/* Date Selection */}
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label>Available Times</Label>
                        {availableSlots.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            No available slots for this date. Please select another date.
                          </p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={selectedTime === slot ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(slot)}
                                className="flex items-center"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tell us more about what you'd like to discuss..."
                        className="mt-1"
                      />
                    </div>

                    {/* Submit */}
                    <Button 
                      type="submit" 
                      disabled={!selectedDate || !selectedTime || loading}
                      className="w-full"
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCall;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateAppointmentDialog } from '@/components/admin/forms/CreateAppointmentDialog';

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
  created_at: string;
}

export const AdminCalendar = () => {
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<CallBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();

    // Set up real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'call_bookings' }, () => {
        fetchBookings();
        toast({
          title: "Calendar Updated",
          description: "New booking activity detected",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('call_bookings')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (bookingId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('call_bookings')
        .update({ completed })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking marked as ${completed ? 'completed' : 'pending'}`,
      });

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.scheduled_at);
          return bookingDate >= today && bookingDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.scheduled_at) > now && !booking.completed
        );
      case 'completed':
        return bookings.filter(booking => booking.completed);
      default:
        return bookings;
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduled_at);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendar & Appointments</h2>
          <p className="text-muted-foreground">Manage customer calls and meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <CreateAppointmentDialog onAppointmentCreated={fetchBookings} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasBooking: (date) => getBookingsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasBooking: { 
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            {selectedDate && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">
                  {selectedDate.toLocaleDateString()} 
                </h4>
                <div className="space-y-2">
                  {getBookingsForDate(selectedDate).map(booking => (
                    <div key={booking.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-muted-foreground">
                        {new Date(booking.scheduled_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))}
                  {getBookingsForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-muted-foreground">No appointments</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointments ({filteredBookings.length})</CardTitle>
            <CardDescription>
              {filter === 'today' && 'Today\'s appointments'}
              {filter === 'upcoming' && 'Upcoming appointments'}
              {filter === 'completed' && 'Completed appointments'}
              {filter === 'all' && 'All appointments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{booking.name}</h4>
                          <Badge variant={booking.completed ? "default" : "secondary"}>
                            {booking.completed ? "Completed" : "Scheduled"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(booking.scheduled_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.scheduled_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} ({booking.duration_minutes}min)
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {booking.email}
                          </div>
                          {booking.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {booking.phone}
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <p className="text-sm bg-muted p-2 rounded">
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}

                        {booking.meeting_link && (
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                              <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant={booking.completed ? "outline" : "default"}
                          onClick={() => markAsCompleted(booking.id, !booking.completed)}
                        >
                          {booking.completed ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Mark Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found</p>
                  <p className="text-sm">
                    {filter === 'today' && "No appointments scheduled for today"}
                    {filter === 'upcoming' && "No upcoming appointments"}
                    {filter === 'completed' && "No completed appointments"}
                    {filter === 'all' && "No appointments have been booked yet"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

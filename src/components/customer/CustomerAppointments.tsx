import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, Mail, Plus, Video } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  customer_id?: string;
  lead_id?: string;
  email: string;
  name: string;
  phone?: string;
  calendly_event_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  completed: boolean;
  meeting_link?: string;
  notes?: string;
  created_at: string;
}

export function CustomerAppointments() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('call_bookings')
        .select('*')
        .eq('customer_id', user?.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (booking: Booking) => {
    const now = new Date();
    const scheduledDate = new Date(booking.scheduled_at);
    
    if (booking.completed) return 'secondary';
    if (isBefore(scheduledDate, now)) return 'secondary';
    return 'default';
  };

  const getStatusText = (booking: Booking) => {
    const now = new Date();
    const scheduledDate = new Date(booking.scheduled_at);
    
    if (booking.completed) return 'Completed';
    if (isBefore(scheduledDate, now)) return 'Past';
    return 'Scheduled';
  };

  const upcomingBookings = bookings.filter(booking => {
    const scheduledDate = new Date(booking.scheduled_at);
    return isAfter(scheduledDate, new Date()) && !booking.completed;
  });

  const pastBookings = bookings.filter(booking => {
    const scheduledDate = new Date(booking.scheduled_at);
    return isBefore(scheduledDate, new Date()) || booking.completed;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
          <CardDescription>Loading your scheduled appointments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Book New Appointment */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <p className="text-muted-foreground">View and manage your scheduled consultations</p>
        </div>
        <Link to="/dashboard/book-call">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pastBookings.filter(b => b.completed).length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Booked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(booking)}>
                          {getStatusText(booking)}
                        </Badge>
                        <Badge variant="outline">
                          Consultation
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.scheduled_at), 'PPP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(booking.scheduled_at), 'p')} ({booking.duration_minutes} min)
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
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
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {booking.meeting_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Appointments */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>Your appointment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(booking)}>
                          {getStatusText(booking)}
                        </Badge>
                        <Badge variant="outline">
                          Consultation
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.scheduled_at), 'PPP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(booking.scheduled_at), 'p')} ({booking.duration_minutes} min)
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {pastBookings.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing last 5 appointments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't booked any consultations with us yet.
            </p>
            <Link to="/dashboard/book-call">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
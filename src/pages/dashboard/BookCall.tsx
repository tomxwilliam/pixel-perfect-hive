import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookCall = () => {
  const navigate = useNavigate();

  const timeSlots = [
    { time: '9:00 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '11:00 AM', available: true },
    { time: '1:00 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '4:00 PM', available: true },
  ];

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
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Project Discovery</h4>
                      <Badge variant="secondary">30 min</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Discuss your project idea and requirements
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Technical Consultation</h4>
                      <Badge variant="secondary">45 min</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Deep dive into technical architecture and solutions
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Project Review</h4>
                      <Badge variant="secondary">30 min</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review progress and discuss next steps
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Interface */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Your Call
                  </CardTitle>
                  <CardDescription>
                    Choose a convenient time for your consultation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Coming Soon Notice */}
                  <div className="text-center py-12">
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Calendly Integration Coming Soon</h3>
                    <p className="text-muted-foreground mb-6">
                      We're integrating with Calendly to make booking even easier. 
                      For now, please contact us directly to schedule your call.
                    </p>
                    
                    <div className="bg-muted rounded-lg p-6 mb-6">
                      <h4 className="font-medium mb-4">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center">
                          <span className="font-medium mr-2">Email:</span>
                          <span>hello@404codelab.com</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <span className="font-medium mr-2">Response Time:</span>
                          <span>Within 4 hours</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={() => navigate('/contact')}>
                        Contact Us Directly
                      </Button>
                      <Button variant="outline">
                        Send Email
                      </Button>
                    </div>
                  </div>

                  {/* Preview of future booking interface */}
                  <div className="mt-8 opacity-50 pointer-events-none">
                    <h4 className="font-medium mb-4">Available Times (Preview)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={slot.available ? "outline" : "ghost"}
                          size="sm"
                          disabled={!slot.available}
                          className="flex items-center"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
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
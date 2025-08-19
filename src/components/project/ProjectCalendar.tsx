import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'milestone' | 'meeting' | 'task';
  project?: string;
  color: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Project Deadline - E-commerce',
    date: '2024-12-15',
    type: 'deadline',
    project: 'E-commerce Website',
    color: 'bg-red-500'
  },
  {
    id: '2',
    title: 'Client Meeting',
    date: '2024-11-25',
    type: 'meeting',
    project: 'Mobile App',
    color: 'bg-blue-500'
  },
  {
    id: '3',
    title: 'Milestone: Design Complete',
    date: '2024-11-22',
    type: 'milestone',
    project: 'E-commerce Website',
    color: 'bg-green-500'
  },
  {
    id: '4',
    title: 'Task: Setup Payment Gateway',
    date: '2024-11-30',
    type: 'task',
    project: 'E-commerce Website',
    color: 'bg-orange-500'
  }
];

const ProjectCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'destructive';
      case 'milestone': return 'default';
      case 'meeting': return 'secondary';
      case 'task': return 'outline';
      default: return 'outline';
    }
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Project Calendar</h2>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-semibold">{formatMonth(currentDate)}</h3>
        <Button variant="outline" onClick={() => navigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-3">
          <Card>
            <CardContent className="p-0">
              {/* Week day headers */}
              <div className="grid grid-cols-7 border-b">
                {weekDays.map(day => (
                  <div key={day} className="p-4 text-center font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const events = getEventsForDate(day as number);
                  const todayClass = isToday(day as number) ? 'bg-primary/10 border-primary' : '';
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border-r border-b hover:bg-muted/50 transition-colors ${todayClass}`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                              {day}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            {events.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${event.color} text-white cursor-pointer hover:opacity-80`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {events.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{events.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2">{event.title}</h4>
                      <Badge variant={getEventTypeColor(event.type)} className="ml-2">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {event.project && (
                      <div className="text-xs text-muted-foreground">
                        Project: {event.project}
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Event Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Event Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Deadlines</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Milestones</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>Meetings</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>Tasks</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;
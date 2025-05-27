
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import { SessionService } from '@/services/SessionService';
import { Session } from '@/models';
import { useToast } from '@/hooks/use-toast';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { branding } = useBranding();
  const { toast } = useToast();

  const primaryColor = branding.primary_color || '#0f766e';
  const secondaryColor = branding.secondary_color || '#14b8a6';

  useEffect(() => {
    loadSessions();
  }, [currentDate]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await SessionService.getSessions();
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
        setSessions([]);
      } else {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive'
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSessionsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return sessions.filter(session => 
      session.session_date.split('T')[0] === dateString
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
              Calendar
            </h1>
            <p className="text-gray-500">Manage your schedule and appointments</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <CalendarIcon className="h-5 w-5 mr-2" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500 border-b"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar grid */}
              {getDaysInMonth(currentDate).map((day, index) => {
                const daySessions = getSessionsForDay(day);
                const isToday = day && 
                  day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-gray-200 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    } ${isToday ? 'ring-2' : ''}`}
                    style={isToday ? { ringColor: primaryColor } : {}}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' : 'text-gray-900'
                        }`}
                        style={isToday ? { backgroundColor: primaryColor } : {}}
                        >
                          {day.getDate()}
                        </div>
                        
                        <div className="space-y-1">
                          {daySessions.map(session => (
                            <div
                              key={session.id}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: `${secondaryColor}15`, color: primaryColor }}
                            >
                              <div className="flex items-center mb-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(session.session_date)}
                              </div>
                              <div className="flex items-center mb-1">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">Client</span>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getStatusColor(session.status)}`}
                              >
                                {session.status}
                              </Badge>
                            </div>
                          ))}
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
    </DashboardLayout>
  );
};

export default CalendarPage;

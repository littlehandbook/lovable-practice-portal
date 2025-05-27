
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Apply branding colors to CSS variables
  useEffect(() => {
    if (branding.primary_color && branding.secondary_color) {
      document.documentElement.style.setProperty('--primary-color', branding.primary_color);
      document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
    }
  }, [branding.primary_color, branding.secondary_color]);

  const primaryColor = branding.primary_color || '#0f766e';
  const secondaryColor = branding.secondary_color || '#14b8a6';

  // Load sessions from the database
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
    } catch (error: any) {
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

  useEffect(() => {
    loadSessions();
  }, []);

  // Calendar grid logic
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

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

  const getSessionsForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessions.filter(session => 
      session.session_date.startsWith(dateString)
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return secondaryColor;
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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
            <p className="text-gray-500">Manage your appointments and schedule</p>
          </div>
          <Button 
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
            className="hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <CalendarIcon className="h-5 w-5 mr-2" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-24"></div>;
                }
                
                const daySessions = getSessionsForDate(day);
                const todayClass = isToday(day) ? 'ring-2 ring-offset-2' : '';
                
                return (
                  <div 
                    key={day}
                    className={`h-24 border rounded-lg p-1 hover:bg-gray-50 cursor-pointer ${todayClass}`}
                    style={{ 
                      ...(isToday(day) ? { ringColor: secondaryColor } : {})
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span 
                        className={`text-sm font-medium ${isToday(day) ? 'font-bold' : ''}`}
                        style={{ 
                          color: isToday(day) ? primaryColor : '#374151'
                        }}
                      >
                        {day}
                      </span>
                      {daySessions.length > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-1 py-0"
                          style={{ 
                            backgroundColor: `${secondaryColor}20`,
                            color: secondaryColor
                          }}
                        >
                          {daySessions.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {daySessions.slice(0, 2).map((session, sessionIndex) => {
                        const sessionTime = new Date(session.session_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        
                        return (
                          <div 
                            key={sessionIndex}
                            className="text-xs p-1 rounded truncate"
                            style={{ 
                              backgroundColor: `${getStatusColor(session.status)}20`,
                              color: getStatusColor(session.status)
                            }}
                          >
                            <div className="font-medium">{sessionTime}</div>
                            <div className="truncate">Client {session.client_id.substring(0, 8)}</div>
                          </div>
                        );
                      })}
                      {daySessions.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daySessions.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <Clock className="h-5 w-5 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions
                .filter(session => {
                  const today = new Date().toISOString().split('T')[0];
                  return session.session_date.startsWith(today);
                })
                .map((session) => {
                  const sessionTime = new Date(session.session_date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                  
                  return (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center min-w-[80px]">
                          <span className="font-medium" style={{ color: primaryColor }}>
                            {sessionTime}
                          </span>
                          <span className="text-xs text-gray-500">
                            {session.duration_minutes || 50} min
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4" style={{ color: secondaryColor }} />
                            <span className="font-medium">Client {session.client_id.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {session.session_type === 'video' ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>{session.session_type === 'video' ? 'Video Call' : 'In-Person'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          style={{ 
                            backgroundColor: getStatusColor(session.status),
                            color: 'white'
                          }}
                        >
                          {session.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          style={{ 
                            borderColor: primaryColor,
                            color: primaryColor
                          }}
                        >
                          {session.session_type === 'video' ? 'Join Call' : 'Start Session'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              
              {sessions.filter(session => {
                const today = new Date().toISOString().split('T')[0];
                return session.session_date.startsWith(today);
              }).length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments today</h3>
                  <p className="text-gray-400 mb-4">Your schedule is clear for today</p>
                  <Button 
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                    className="hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;

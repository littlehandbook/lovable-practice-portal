
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { SessionService } from '@/services/SessionService';
import { Session } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { useBranding } from '@/hooks/useBranding';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { branding } = useBranding();

  const primaryColor = branding.primary_color || '#0f766e';

  useEffect(() => {
    loadSessions();
  }, [currentDate]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await SessionService.getSessionsByDateRange(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      );

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive'
        });
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
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => 
      session.session_date?.split('T')[0] === dateStr
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

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <Button 
            className="flex items-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <CardTitle className="text-xl">
                {formatMonthYear(currentDate)}
              </CardTitle>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500 border-b"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const daySessionsData = getSessionsForDate(day);
                const isCurrentMonthDay = isCurrentMonth(day);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors
                      ${isCurrentMonthDay ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                      ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                    `}
                    style={isTodayDate ? { 
                      borderColor: primaryColor,
                      backgroundColor: `${primaryColor}08`
                    } : {}}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-medium ${
                        isTodayDate ? 'text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center' : ''
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {daySessionsData.slice(0, 3).map((session, sessionIndex) => (
                        <div
                          key={sessionIndex}
                          className={`text-xs p-1 rounded text-white truncate ${getSessionStatusColor(session.status)}`}
                          title={`${session.session_time} - ${session.status}`}
                        >
                          {session.session_time}
                        </div>
                      ))}
                      
                      {daySessionsData.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daySessionsData.length - 3} more
                        </div>
                      )}
                    </div>
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

export default Calendar;

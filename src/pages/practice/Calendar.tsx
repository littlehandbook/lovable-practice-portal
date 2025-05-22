
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Mock data for scheduled sessions
  const scheduledSessions = [
    { id: 1, clientName: 'Jane Doe', time: '09:00', duration: 50 },
    { id: 2, clientName: 'John Smith', time: '11:00', duration: 50 },
    { id: 3, clientName: 'Emily Johnson', time: '14:00', duration: 50 },
  ];
  
  // Mock data for availability
  const availabilitySlots = [
    { id: 1, day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { id: 2, day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    { id: 3, day: 'Wednesday', startTime: '12:00', endTime: '20:00' },
    { id: 4, day: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { id: 5, day: 'Friday', startTime: '09:00', endTime: '15:00' },
  ];

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handlePreviousDate = () => {
    const newDate = new Date(date);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(date);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setDate(newDate);
  };

  const formatDateRange = () => {
    if (view === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const isSessionScheduled = (time: string) => {
    return scheduledSessions.some(session => session.time === time);
  };

  const getSessionForTime = (time: string) => {
    return scheduledSessions.find(session => session.time === time);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setOpenAvailabilityDialog(true)}>
            <Clock className="h-4 w-4 mr-2" /> Set Availability
          </Button>
        </div>
        
        <Card>
          <CardHeader className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 items-center">
                <button
                  onClick={handlePreviousDate}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold">{formatDateRange()}</h2>
                <button
                  onClick={handleNextDate}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {view === 'month' && (
              <div className="p-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  className="p-3 pointer-events-auto"
                />
              </div>
            )}
            
            {view === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-6 border-b">
                    <div className="p-4 text-center font-medium text-gray-500 border-r">Time</div>
                    {daysOfWeek.map((day) => (
                      <div key={day} className="p-4 text-center font-medium">{day}</div>
                    ))}
                  </div>
                  
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-6 border-b">
                      <div className="p-4 text-center text-gray-500 border-r">{time}</div>
                      {daysOfWeek.map((day) => {
                        // Here we'd normally check if a session exists at this time/day
                        // For simplicity, we'll just randomly place some sessions
                        const hasSession = Math.random() > 0.8;
                        return (
                          <div key={`${day}-${time}`} className="p-2 border-r relative min-h-[80px]">
                            {hasSession ? (
                              <div className="absolute inset-1 bg-teal-100 border border-teal-200 rounded p-2">
                                <div className="text-sm font-medium text-teal-800">Client Session</div>
                                <div className="text-xs text-teal-600">{time} - {parseInt(time) + 1}:00</div>
                              </div>
                            ) : (
                              <button 
                                className="absolute inset-1 border border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                                aria-label="Add session"
                              >
                                <Plus className="h-4 w-4 text-gray-400" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {view === 'day' && (
              <div className="space-y-2">
                {timeSlots.map((time) => {
                  const session = getSessionForTime(time);
                  return (
                    <div key={time} className="flex border rounded-lg overflow-hidden">
                      <div className="w-24 p-4 bg-gray-50 text-center border-r">
                        {time}
                      </div>
                      <div className="flex-1 p-4">
                        {session ? (
                          <div className="bg-teal-100 border border-teal-200 rounded p-3">
                            <div className="text-sm font-medium text-teal-800">{session.clientName}</div>
                            <div className="text-xs text-teal-600">{time} - {parseInt(time) + 1}:00 ({session.duration} min)</div>
                          </div>
                        ) : (
                          <button 
                            className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 min-h-[60px]"
                            aria-label="Add session"
                          >
                            <Plus className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Set Availability Dialog */}
      <Dialog open={openAvailabilityDialog} onOpenChange={setOpenAvailabilityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availabilitySlots.map((slot) => (
              <div key={slot.id} className="grid grid-cols-3 gap-4 items-center">
                <div className="font-medium">{slot.day}</div>
                <div>
                  <Input 
                    type="time" 
                    defaultValue={slot.startTime} 
                    className="w-full" 
                  />
                </div>
                <div>
                  <Input 
                    type="time" 
                    defaultValue={slot.endTime} 
                    className="w-full" 
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAvailabilityDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setOpenAvailabilityDialog(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalendarPage;

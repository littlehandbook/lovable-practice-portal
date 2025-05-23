import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';

interface AvailabilitySlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface SessionBooking {
  id: number;
  clientName: string;
  time: string;
  day: string;
  duration: number;
  type: 'session' | 'consultation';
}

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{time: string, day: string} | null>(null);
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    sessionType: 'session',
    duration: 50,
    notes: ''
  });
  const { toast } = useToast();
  
  // Mock data for scheduled sessions
  const [scheduledSessions, setScheduledSessions] = useState<SessionBooking[]>([
    { id: 1, clientName: 'Jane Doe', time: '09:00', day: 'Monday', duration: 50, type: 'session' },
    { id: 2, clientName: 'John Smith', time: '11:00', day: 'Tuesday', duration: 50, type: 'session' },
    { id: 3, clientName: 'Emily Johnson', time: '14:00', day: 'Wednesday', duration: 50, type: 'consultation' },
  ]);
  
  // Availability state with enabled/disabled functionality
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { id: 1, day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: 2, day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: 3, day: 'Wednesday', startTime: '12:00', endTime: '20:00', enabled: true },
    { id: 4, day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
    { id: 5, day: 'Friday', startTime: '09:00', endTime: '15:00', enabled: true },
    { id: 6, day: 'Saturday', startTime: '', endTime: '', enabled: false },
    { id: 7, day: 'Sunday', startTime: '', endTime: '', enabled: false },
  ]);

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleSlotSelect = (time: string, day: string) => {
    // Check if slot is already booked
    const isBooked = scheduledSessions.some(session => session.time === time && session.day === day);
    if (isBooked) {
      toast({
        title: 'Slot Unavailable',
        description: 'This time slot is already booked.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedTimeSlot({ time, day });
    setOpenBookingDialog(true);
  };

  const handleBookSession = () => {
    if (!selectedTimeSlot || !bookingForm.clientName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newSession: SessionBooking = {
      id: Date.now(),
      clientName: bookingForm.clientName,
      time: selectedTimeSlot.time,
      day: selectedTimeSlot.day,
      duration: bookingForm.duration,
      type: bookingForm.sessionType as 'session' | 'consultation'
    };

    setScheduledSessions(prev => [...prev, newSession]);
    
    toast({
      title: 'Session Booked',
      description: `Session with ${bookingForm.clientName} scheduled for ${selectedTimeSlot.day} at ${selectedTimeSlot.time}.`,
    });

    // Reset form and close dialog
    setBookingForm({
      clientName: '',
      sessionType: 'session',
      duration: 50,
      notes: ''
    });
    setSelectedTimeSlot(null);
    setOpenBookingDialog(false);
  };

  const handleAvailabilityChange = (id: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setAvailabilitySlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSaveAvailability = () => {
    console.log('Saving availability:', availabilitySlots);
    
    toast({
      title: 'Availability Updated',
      description: 'Your availability schedule has been saved successfully.',
    });
    
    setOpenAvailabilityDialog(false);
  };

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

  const isSessionScheduled = (time: string, day: string) => {
    return scheduledSessions.some(session => session.time === time && session.day === day);
  };

  const getSessionForTime = (time: string, day: string) => {
    return scheduledSessions.find(session => session.time === time && session.day === day);
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
                        const session = getSessionForTime(time, day);
                        const hasSession = !!session;
                        
                        return (
                          <div key={`${day}-${time}`} className="p-2 border-r relative min-h-[80px]">
                            {hasSession ? (
                              <div className="absolute inset-1 bg-teal-100 border border-teal-200 rounded p-2">
                                <div className="text-sm font-medium text-teal-800">{session.clientName}</div>
                                <div className="text-xs text-teal-600">{time} - {parseInt(time.split(':')[0]) + 1}:00</div>
                                <div className="text-xs text-teal-500 capitalize">{session.type}</div>
                              </div>
                            ) : (
                              <button 
                                className="absolute inset-1 border border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 hover:border-teal-300 transition-colors"
                                onClick={() => handleSlotSelect(time, day)}
                                aria-label={`Book session for ${day} at ${time}`}
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
                  const session = getSessionForTime(time, formatDateRange().split(',')[0]);
                  return (
                    <div key={time} className="flex border rounded-lg overflow-hidden">
                      <div className="w-24 p-4 bg-gray-50 text-center border-r">
                        {time}
                      </div>
                      <div className="flex-1 p-4">
                        {session ? (
                          <div className="bg-teal-100 border border-teal-200 rounded p-3">
                            <div className="text-sm font-medium text-teal-800">{session.clientName}</div>
                            <div className="text-xs text-teal-600">{time} - {parseInt(time.split(':')[0]) + 1}:00 ({session.duration} min)</div>
                            <div className="text-xs text-teal-500 capitalize">{session.type}</div>
                          </div>
                        ) : (
                          <button 
                            className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 min-h-[60px]"
                            onClick={() => handleSlotSelect(time, formatDateRange().split(',')[0])}
                            aria-label={`Book session for ${time}`}
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
      
      {/* Book Session Dialog */}
      <Dialog open={openBookingDialog} onOpenChange={setOpenBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book New Session</DialogTitle>
            <DialogDescription>
              {selectedTimeSlot && `Schedule a session for ${selectedTimeSlot.day} at ${selectedTimeSlot.time}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={bookingForm.clientName}
                onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={bookingForm.sessionType} onValueChange={(value) => setBookingForm(prev => ({ ...prev, sessionType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">Therapy Session</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={bookingForm.duration.toString()} onValueChange={(value) => setBookingForm(prev => ({ ...prev, duration: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="50">50 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Session notes or special instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBookingDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleBookSession}>
              Book Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Set Availability Dialog */}
      <Dialog open={openAvailabilityDialog} onOpenChange={setOpenAvailabilityDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Your Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {availabilitySlots.map((slot) => (
              <div key={slot.id} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg">
                <div className="font-medium">{slot.day}</div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={slot.enabled}
                    onCheckedChange={(checked) => handleAvailabilityChange(slot.id, 'enabled', checked)}
                  />
                  <Label className="text-sm">Available</Label>
                </div>
                <div>
                  <Input 
                    type="time" 
                    value={slot.startTime}
                    onChange={(e) => handleAvailabilityChange(slot.id, 'startTime', e.target.value)}
                    disabled={!slot.enabled}
                    className="w-full" 
                    placeholder="Start time"
                  />
                </div>
                <div>
                  <Input 
                    type="time" 
                    value={slot.endTime}
                    onChange={(e) => handleAvailabilityChange(slot.id, 'endTime', e.target.value)}
                    disabled={!slot.enabled}
                    className="w-full" 
                    placeholder="End time"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {slot.enabled && slot.startTime && slot.endTime 
                    ? `${slot.startTime} - ${slot.endTime}` 
                    : 'Not available'
                  }
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAvailabilityDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveAvailability}>
              Save Availability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalendarPage;

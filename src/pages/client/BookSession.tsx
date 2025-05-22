
import React, { useState } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Video, User } from 'lucide-react';

const BookSessionPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [step, setStep] = useState<'select-date' | 'select-time' | 'confirm'>('select-date');
  const [loading, setLoading] = useState(false);
  
  // Mock data for available time slots
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setStep('select-time');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setStep('confirm');
  };

  const handleConfirmBooking = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to success page or show success message
      alert('Session booked successfully!');
    }, 1500);
  };

  const handleBack = () => {
    if (step === 'select-time') {
      setStep('select-date');
    } else if (step === 'confirm') {
      setStep('select-time');
      setSelectedTimeSlot(null);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Book a Session</h1>
          {step !== 'select-date' && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Your Next Session</CardTitle>
              <CardDescription>
                Select a date and time that works for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'select-date' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-sm mx-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      className="p-3 pointer-events-auto rounded border"
                      disabled={(date) => {
                        // Disable past dates and weekends in this example
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const day = date.getDay();
                        return date < today || day === 0 || day === 6;
                      }}
                    />
                  </div>
                  <p className="text-center text-gray-500">
                    Select an available date to continue
                  </p>
                </div>
              )}
              
              {step === 'select-time' && date && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium">
                      Available times for {format(date, 'EEEE, MMMM d, yyyy')}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center"
                        onClick={() => handleTimeSelect(time)}
                      >
                        <Clock className="h-4 w-4 mb-1" />
                        <span>{time}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {availableTimeSlots.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No available time slots for this date.</p>
                      <Button variant="outline" className="mt-4" onClick={() => setStep('select-date')}>
                        Choose Another Date
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {step === 'confirm' && date && selectedTimeSlot && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium">Confirm Your Booking</h3>
                    
                    <div className="mt-4 space-y-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium">Date</p>
                          <p className="text-gray-600">{format(date, 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-gray-600">{selectedTimeSlot} - {parseInt(selectedTimeSlot.split(':')[0]) + 1}:00</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium">Therapist</p>
                          <p className="text-gray-600">Dr. Jane Smith</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Video className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                        <div>
                          <p className="font-medium">Session Type</p>
                          <p className="text-gray-600">Video Session (50 minutes)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      By confirming, you agree to our cancellation policy. You can cancel or reschedule up to 24 hours before your session.
                    </p>
                    
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      onClick={handleConfirmBooking}
                      disabled={loading}
                    >
                      {loading ? 'Confirming...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
};

export default BookSessionPage;

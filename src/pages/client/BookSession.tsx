
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, User, Check } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

const BookSessionPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'video' | 'in-person'>('video');
  const { branding } = useBranding();
  
  // Apply branding colors to CSS variables
  useEffect(() => {
    if (branding.primary_color && branding.secondary_color) {
      document.documentElement.style.setProperty('--primary-color', branding.primary_color);
      document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
    }
  }, [branding.primary_color, branding.secondary_color]);

  const primaryColor = branding.primary_color || '#7c3aed';
  const secondaryColor = branding.secondary_color || '#8b5cf6';

  // Mock available dates and times
  const availableDates = [
    { date: '2024-01-22', dayName: 'Monday', slots: 3 },
    { date: '2024-01-23', dayName: 'Tuesday', slots: 5 },
    { date: '2024-01-24', dayName: 'Wednesday', slots: 2 },
    { date: '2024-01-25', dayName: 'Thursday', slots: 4 },
    { date: '2024-01-26', dayName: 'Friday', slots: 1 }
  ];

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      console.log('Booking session:', { selectedDate, selectedTime, selectedType });
      // In a real app, this would make an API call
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
            Book a Session
          </h1>
          <p className="text-gray-500">Schedule your next therapy session</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Session Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <User className="h-5 w-5 mr-2" />
                Session Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setSelectedType('video')}
                className={`w-full p-4 border rounded-lg text-left transition-all ${
                  selectedType === 'video' ? 'border-2' : 'border hover:bg-gray-50'
                }`}
                style={selectedType === 'video' ? {
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}10`
                } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Video className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
                    <div>
                      <div className="font-medium">Video Session</div>
                      <div className="text-sm text-gray-500">Online therapy session</div>
                    </div>
                  </div>
                  {selectedType === 'video' && (
                    <Check className="h-5 w-5" style={{ color: primaryColor }} />
                  )}
                </div>
              </button>

              <button
                onClick={() => setSelectedType('in-person')}
                className={`w-full p-4 border rounded-lg text-left transition-all ${
                  selectedType === 'in-person' ? 'border-2' : 'border hover:bg-gray-50'
                }`}
                style={selectedType === 'in-person' ? {
                  borderColor: secondaryColor,
                  backgroundColor: `${secondaryColor}10`
                } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3" style={{ color: secondaryColor }} />
                    <div>
                      <div className="font-medium">In-Person Session</div>
                      <div className="text-sm text-gray-500">Visit the office</div>
                    </div>
                  </div>
                  {selectedType === 'in-person' && (
                    <Check className="h-5 w-5" style={{ color: secondaryColor }} />
                  )}
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <Calendar className="h-5 w-5 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableDates.map((dateOption) => (
                  <button
                    key={dateOption.date}
                    onClick={() => setSelectedDate(dateOption.date)}
                    className={`w-full p-3 border rounded-lg text-left transition-all ${
                      selectedDate === dateOption.date ? 'border-2' : 'border hover:bg-gray-50'
                    }`}
                    style={selectedDate === dateOption.date ? {
                      borderColor: primaryColor,
                      backgroundColor: `${primaryColor}10`
                    } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{dateOption.dayName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(dateOption.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: secondaryColor, 
                          color: secondaryColor 
                        }}
                      >
                        {dateOption.slots} slots
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <Clock className="h-5 w-5 mr-2" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="grid grid-cols-2 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        selectedTime === time ? 'border-2' : 'border hover:bg-gray-50'
                      }`}
                      style={selectedTime === time ? {
                        borderColor: secondaryColor,
                        backgroundColor: `${secondaryColor}10`,
                        color: secondaryColor
                      } : {}}
                    >
                      <div className="font-medium">{time}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>Select a date first</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        {(selectedDate || selectedTime || selectedType) && (
          <Card>
            <CardHeader>
              <CardTitle style={{ color: primaryColor }}>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                      {selectedType === 'video' ? 
                        <Video className="h-5 w-5" style={{ color: primaryColor }} /> :
                        <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                      }
                    </div>
                    <div>
                      <div className="font-medium">Session Type</div>
                      <div className="text-sm text-gray-500">
                        {selectedType === 'video' ? 'Video Call' : 'In-Person'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${secondaryColor}10` }}>
                      <Calendar className="h-5 w-5" style={{ color: secondaryColor }} />
                    </div>
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-sm text-gray-500">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                      <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-sm text-gray-500">
                        {selectedTime || 'Not selected'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime}
                    style={{ 
                      backgroundColor: selectedDate && selectedTime ? primaryColor : undefined,
                      color: selectedDate && selectedTime ? 'white' : undefined
                    }}
                    className={selectedDate && selectedTime ? "hover:opacity-90" : ""}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
};

export default BookSessionPage;

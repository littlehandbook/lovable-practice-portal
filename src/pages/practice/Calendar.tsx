
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, Plus } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { branding } = useBranding();
  
  // Apply branding colors to CSS variables
  useEffect(() => {
    if (branding.primary_color && branding.secondary_color) {
      document.documentElement.style.setProperty('--primary-color', branding.primary_color);
      document.documentElement.style.setProperty('--secondary-color', branding.secondary_color);
    }
  }, [branding.primary_color, branding.secondary_color]);

  const primaryColor = branding.primary_color || '#0f766e';
  const secondaryColor = branding.secondary_color || '#14b8a6';

  // Mock appointment data
  const appointments = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      time: '09:00 AM',
      duration: '50 min',
      type: 'In-Person',
      status: 'confirmed',
      location: 'Office Room A'
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      time: '10:30 AM',
      duration: '50 min',
      type: 'Video Call',
      status: 'confirmed',
      location: 'Telehealth'
    },
    {
      id: '3',
      clientName: 'Emma Wilson',
      time: '02:00 PM',
      duration: '50 min',
      type: 'In-Person',
      status: 'pending',
      location: 'Office Room B'
    },
    {
      id: '4',
      clientName: 'Alex Brown',
      time: '03:30 PM',
      duration: '50 min',
      type: 'Video Call',
      status: 'confirmed',
      location: 'Telehealth'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return secondaryColor;
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Video Call' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Widget */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified calendar - in a real app, you'd use a proper calendar component */}
              <div className="text-center py-8">
                <div className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <p className="text-gray-500">Today's Schedule</p>
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                  <span className="font-medium">Total Appointments</span>
                  <Badge style={{ backgroundColor: primaryColor, color: 'white' }}>
                    {appointments.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${secondaryColor}10` }}>
                  <span className="font-medium">Confirmed</span>
                  <Badge style={{ backgroundColor: secondaryColor, color: 'white' }}>
                    {appointments.filter(apt => apt.status === 'confirmed').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: primaryColor }}>
                <Clock className="h-5 w-5 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center min-w-[80px]">
                        <span className="font-medium" style={{ color: primaryColor }}>
                          {appointment.time}
                        </span>
                        <span className="text-xs text-gray-500">{appointment.duration}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4" style={{ color: secondaryColor }} />
                          <span className="font-medium">{appointment.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {getTypeIcon(appointment.type)}
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        style={{ 
                          backgroundColor: getStatusColor(appointment.status),
                          color: 'white'
                        }}
                      >
                        {appointment.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        style={{ 
                          borderColor: primaryColor,
                          color: primaryColor
                        }}
                      >
                        {appointment.type === 'Video Call' ? 'Join Call' : 'Start Session'}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {appointments.length === 0 && (
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

        {/* Week Overview */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: primaryColor }}>Week Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="font-medium mb-2" style={{ color: primaryColor }}>{day}</div>
                  <div className="h-24 border rounded-lg p-2 text-xs">
                    {index === 1 && (
                      <div 
                        className="bg-opacity-20 rounded p-1 mb-1"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        <div className="text-xs" style={{ color: secondaryColor }}>9:00 AM</div>
                        <div className="font-medium">Sarah J.</div>
                      </div>
                    )}
                    {index === 3 && (
                      <>
                        <div 
                          className="bg-opacity-20 rounded p-1 mb-1"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <div className="text-xs" style={{ color: primaryColor }}>10:00 AM</div>
                          <div className="font-medium">Michael C.</div>
                        </div>
                        <div 
                          className="bg-opacity-20 rounded p-1"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          <div className="text-xs" style={{ color: secondaryColor }}>2:00 PM</div>
                          <div className="font-medium">Emma W.</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;

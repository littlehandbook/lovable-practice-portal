
import React, { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';

const ClientSessionsPage = () => {
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

  // Mock session data
  const upcomingSessions = [
    {
      id: '1',
      date: '2024-01-25',
      time: '2:00 PM',
      duration: '50 min',
      type: 'video',
      status: 'confirmed',
      therapist: 'Dr. Jane Smith'
    },
    {
      id: '2',
      date: '2024-02-01',
      time: '2:00 PM',
      duration: '50 min',
      type: 'in-person',
      status: 'confirmed',
      therapist: 'Dr. Jane Smith'
    }
  ];

  const pastSessions = [
    {
      id: '3',
      date: '2024-01-18',
      time: '2:00 PM',
      duration: '50 min',
      type: 'video',
      status: 'completed',
      therapist: 'Dr. Jane Smith',
      hasNotes: true
    },
    {
      id: '4',
      date: '2024-01-11',
      time: '2:00 PM',
      duration: '50 min',
      type: 'in-person',
      status: 'completed',
      therapist: 'Dr. Jane Smith',
      hasNotes: true
    },
    {
      id: '5',
      date: '2024-01-04',
      time: '2:00 PM',
      duration: '50 min',
      type: 'video',
      status: 'completed',
      therapist: 'Dr. Jane Smith',
      hasNotes: false
    }
  ];

  const getTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return secondaryColor;
      case 'completed': return primaryColor;
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
              My Sessions
            </h1>
            <p className="text-gray-500">View your upcoming and past therapy sessions</p>
          </div>
          <Button asChild style={{ backgroundColor: primaryColor, color: 'white' }} className="hover:opacity-90">
            <Link to="/client/book">
              <Plus className="h-4 w-4 mr-2" />
              Book Session
            </Link>
          </Button>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center min-w-[100px]">
                        <span className="font-medium" style={{ color: primaryColor }}>
                          {session.time}
                        </span>
                        <span className="text-xs text-gray-500">{session.duration}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {formatDate(session.date)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(session.type)}
                            <span>{session.type === 'video' ? 'Video Call' : 'In-Person'}</span>
                          </div>
                          <span>with {session.therapist}</span>
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
                        style={{ 
                          backgroundColor: secondaryColor,
                          color: 'white'
                        }}
                        className="hover:opacity-90"
                      >
                        {session.type === 'video' ? 'Join Call' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No upcoming sessions</h3>
                <p className="text-gray-400 mb-4">Book your next session to continue your therapy journey</p>
                <Button asChild style={{ backgroundColor: primaryColor, color: 'white' }} className="hover:opacity-90">
                  <Link to="/client/book">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Session
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <FileText className="h-5 w-5 mr-2" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center min-w-[100px]">
                        <span className="font-medium" style={{ color: primaryColor }}>
                          {session.time}
                        </span>
                        <span className="text-xs text-gray-500">{session.duration}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {formatDate(session.date)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(session.type)}
                            <span>{session.type === 'video' ? 'Video Call' : 'In-Person'}</span>
                          </div>
                          <span>with {session.therapist}</span>
                          {session.hasNotes && (
                            <div className="flex items-center space-x-1" style={{ color: secondaryColor }}>
                              <FileText className="h-3 w-3" />
                              <span>Notes available</span>
                            </div>
                          )}
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
                      {session.hasNotes && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          style={{ 
                            borderColor: secondaryColor,
                            color: secondaryColor
                          }}
                          asChild
                        >
                          <Link to="/client/documents">
                            <FileText className="h-4 w-4 mr-1" />
                            View Notes
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No session history</h3>
                <p className="text-gray-400">Your completed sessions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                  <Calendar className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {pastSessions.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${secondaryColor}10` }}>
                  <Video className="h-5 w-5" style={{ color: secondaryColor }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: secondaryColor }}>
                    {pastSessions.filter(s => s.type === 'video').length}
                  </div>
                  <div className="text-sm text-gray-500">Video Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                  <FileText className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {pastSessions.filter(s => s.hasNotes).length}
                  </div>
                  <div className="text-sm text-gray-500">With Notes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientSessionsPage;

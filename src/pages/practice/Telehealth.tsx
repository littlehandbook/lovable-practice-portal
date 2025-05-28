import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, Users, Clock, Monitor, Settings, Play, Pause, PhoneOff } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import { VideoSessionService, VideoSession } from '@/services/VideoSessionService';
import { TwilioAccessToken } from '@/services/TwilioApiService';
import { useToast } from '@/components/ui/use-toast';

const TelehealthPage = () => {
  const [activeSession, setActiveSession] = useState<VideoSession | null>(null);
  const [accessToken, setAccessToken] = useState<TwilioAccessToken | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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

  // Mock upcoming sessions - in real app this would come from SessionService
  const upcomingSessions = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      time: '10:00 AM',
      duration: '50 min',
      status: 'ready',
      sessionId: 'session-1'
    },
    {
      id: '2',
      clientName: 'Michael Chen',
      time: '11:30 AM',
      duration: '50 min',
      status: 'waiting',
      sessionId: 'session-2'
    },
    {
      id: '3',
      clientName: 'Emma Wilson',
      time: '2:00 PM',
      duration: '50 min',
      status: 'scheduled',
      sessionId: 'session-3'
    }
  ];

  const handleStartSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      console.log('Starting session:', sessionId);

      // Join the video session as a practitioner
      const { data: token, error } = await VideoSessionService.joinVideoSession(
        sessionId,
        'current-user-id', // In real app, get from auth context
        'practitioner'
      );

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return;
      }

      if (token) {
        setAccessToken(token);
        
        // Get session details
        const { data: session } = await VideoSessionService.getVideoSession(sessionId);
        if (session) {
          setActiveSession(session);
          toast({
            title: "Session Started",
            description: "Video session is now active"
          });
        }
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start video session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      setIsLoading(true);
      console.log('Ending session:', activeSession.sessionId);

      const { error } = await VideoSessionService.endVideoSession(activeSession.sessionId);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
        return;
      }

      setActiveSession(null);
      setAccessToken(null);
      toast({
        title: "Session Ended",
        description: "Video session has been terminated"
      });
    } catch (error: any) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end video session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return secondaryColor;
      case 'waiting': return '#f59e0b';
      case 'scheduled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready to Join';
      case 'waiting': return 'Client Waiting';
      case 'scheduled': return 'Scheduled';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
            Telehealth
          </h1>
          <p className="text-gray-500">Conduct secure video sessions with your clients</p>
        </div>

        {/* Current Session Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <Video className="h-5 w-5 mr-2" />
              Current Session Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <div className="text-center py-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>
                  Active Session
                </h3>
                <p className="text-gray-500 mb-2">Room: {activeSession.roomName}</p>
                <p className="text-gray-500 mb-4">Participants: {activeSession.participants}/{activeSession.maxParticipants}</p>
                
                {accessToken && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Access Token Generated</p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {accessToken.token.substring(0, 50)}...
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center space-x-4 mb-6">
                  <Button
                    variant={isVideoEnabled ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    style={isVideoEnabled ? { 
                      backgroundColor: primaryColor,
                      color: 'white'
                    } : {
                      borderColor: primaryColor,
                      color: primaryColor
                    }}
                  >
                    <Video className="h-5 w-5 mr-2" />
                    {isVideoEnabled ? 'Video On' : 'Video Off'}
                  </Button>
                  
                  <Button
                    variant={isAudioEnabled ? "default" : "outline"}
                    size="lg"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    style={isAudioEnabled ? { 
                      backgroundColor: secondaryColor,
                      color: 'white'
                    } : {
                      borderColor: secondaryColor,
                      color: secondaryColor
                    }}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {isAudioEnabled ? 'Audio On' : 'Audio Off'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleEndSession}
                    disabled={isLoading}
                  >
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Session
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>HD</div>
                    <div className="text-sm text-gray-500">Video Quality</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: secondaryColor }}>
                      {activeSession.status.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>Secure</div>
                    <div className="text-sm text-gray-500">Connection</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Monitor className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No Active Session</h3>
                <p className="text-gray-400 mb-4">Start a telehealth session from your scheduled appointments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <Clock className="h-5 w-5 mr-2" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <span className="font-medium" style={{ color: primaryColor }}>
                        {session.time}
                      </span>
                      <span className="text-xs text-gray-500">{session.duration}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4" style={{ color: secondaryColor }} />
                        <span className="font-medium">{session.clientName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Video className="h-4 w-4" />
                        <span>Telehealth Session</span>
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
                      {getStatusText(session.status)}
                    </Badge>
                    <Button 
                      size="sm"
                      disabled={session.status === 'scheduled' || isLoading || !!activeSession}
                      onClick={() => handleStartSession(session.sessionId)}
                      style={{ 
                        backgroundColor: session.status !== 'scheduled' && !activeSession ? primaryColor : undefined,
                        color: session.status !== 'scheduled' && !activeSession ? 'white' : undefined
                      }}
                      className={session.status !== 'scheduled' && !activeSession ? "hover:opacity-90" : ""}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          {session.status === 'waiting' ? 'Join Now' : 
                           session.status === 'ready' ? 'Start Session' : 
                           'Not Ready'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: primaryColor }}>
              <Settings className="h-5 w-5 mr-2" />
              Telehealth Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: primaryColor }}>Audio & Video</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Default Video Quality</span>
                    <Badge variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                      HD (720p)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audio Enhancement</span>
                    <Badge variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Background Blur</span>
                    <Badge variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                      Available
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: primaryColor }}>Security</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">End-to-End Encryption</span>
                    <Badge style={{ backgroundColor: secondaryColor, color: 'white' }}>
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Recording</span>
                    <Badge variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HIPAA Compliant</span>
                    <Badge style={{ backgroundColor: primaryColor, color: 'white' }}>
                      Certified
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline"
                style={{ 
                  borderColor: primaryColor,
                  color: primaryColor
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TelehealthPage;

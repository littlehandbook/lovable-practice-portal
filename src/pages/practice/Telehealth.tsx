
import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Video, Mic, MicOff, VideoOff, Phone, MessageCircle, Users, Settings } from 'lucide-react';

const TelehealthPage = () => {
  const mockSession = {
    id: 1,
    client: {
      name: 'Jane Doe',
      joinedAt: '2:02 PM'
    },
    startedAt: '2:00 PM',
    duration: 50,
    status: 'active'
  };
  
  const mockMessages = [
    { id: 1, sender: 'Jane Doe', content: 'Hello, I\'m ready for our session today.', time: '2:01 PM' },
    { id: 2, sender: 'You', content: 'Great! How are you feeling today?', time: '2:02 PM' },
    { id: 3, sender: 'Jane Doe', content: 'I\'m doing better than last week, but still having some anxiety about work.', time: '2:03 PM' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Telehealth Session</h1>
            <p className="text-sm text-gray-500">
              Session with {mockSession.client.name} • Started at {mockSession.startedAt}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </Button>
            <Button variant="destructive" size="sm">
              <Phone className="h-4 w-4 mr-1" /> End Session
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-0 relative">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  {/* This would be the video stream in a real app */}
                  <div className="text-white text-center">
                    <Video className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-lg">Video placeholder</p>
                    <p className="text-sm text-gray-400">Client video would appear here</p>
                  </div>
                </div>
                
                {/* Self-view */}
                <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg border-2 border-white flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-xs">You</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="lg" className="rounded-full h-12 w-12 p-0">
                <Mic className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-12 w-12 p-0">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="destructive" size="lg" className="rounded-full h-12 w-12 p-0">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-12 w-12 p-0">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-12 w-12 p-0">
                <Users className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Session Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {mockMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'You' 
                            ? 'bg-teal-100 text-teal-900' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.sender !== 'You' && (
                          <p className="text-xs font-medium mb-1">{message.sender}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex space-x-2">
                    <Input 
                      className="flex-1" 
                      placeholder="Type a message..." 
                    />
                    <Button className="bg-teal-600 hover:bg-teal-700">Send</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Add the missing Input component for the chat
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default TelehealthPage;

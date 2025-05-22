
import React, { useState } from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Video } from 'lucide-react';

const ClientSessionsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Mock data
  const upcomingSessions = [
    { id: 1, date: 'May 25, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Confirmed' },
    { id: 2, date: 'June 1, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Confirmed' },
  ];
  
  const pastSessions = [
    { id: 3, date: 'May 18, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Completed', hasNotes: true },
    { id: 4, date: 'May 11, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Completed', hasNotes: true },
    { id: 5, date: 'May 4, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Completed', hasNotes: true },
    { id: 6, date: 'April 27, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Completed', hasNotes: false },
    { id: 7, date: 'April 20, 2023', time: '2:00 PM', therapist: 'Dr. Jane Smith', type: 'Video', status: 'Completed', hasNotes: false },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">My Sessions</h1>
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link to="/client/book">
              <Calendar className="h-4 w-4 mr-2" />
              Book New Session
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-medium">{session.date} at {session.time}</p>
                              <p className="text-sm text-gray-500">with {session.therapist}</p>
                              <div className="flex items-center mt-1">
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  {session.type} Session
                                </span>
                                <span className="px-2 py-1 ml-2 text-xs bg-green-100 text-green-800 rounded-full">
                                  {session.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                Reschedule
                              </Button>
                              <Button 
                                className="bg-purple-600 hover:bg-purple-700" 
                                size="sm"
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join Session
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">You don't have any upcoming sessions</p>
                    <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                      <Link to="/client/book">Book a Session</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {pastSessions.length > 0 ? (
                  <div className="space-y-4">
                    {pastSessions.map((session) => (
                      <Card key={session.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="font-medium">{session.date} at {session.time}</p>
                              <p className="text-sm text-gray-500">with {session.therapist}</p>
                              <div className="flex items-center mt-1">
                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                  {session.type} Session
                                </span>
                                <span className="px-2 py-1 ml-2 text-xs bg-gray-100 text-gray-800 rounded-full">
                                  {session.status}
                                </span>
                              </div>
                            </div>
                            <div>
                              {session.hasNotes ? (
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  View Notes
                                </Button>
                              ) : (
                                <span className="text-sm text-gray-500">No notes available</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">You don't have any past sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientSessionsPage;

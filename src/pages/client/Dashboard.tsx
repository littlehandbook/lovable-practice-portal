
import React from 'react';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Video, Upload, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  // Mock data
  const nextSession = {
    date: 'May 25, 2023',
    time: '2:00 PM',
    therapist: 'Dr. Jane Smith',
    type: 'Video'
  };
  
  const recentDocuments = [
    { id: 1, name: 'Session Notes - May 18', date: 'May 18, 2023' },
    { id: 2, name: 'Intake Form', date: 'May 10, 2023' }
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Client Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              {nextSession ? (
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xl font-medium">{nextSession.date} at {nextSession.time}</p>
                    <p className="text-gray-500">with {nextSession.therapist}</p>
                    <p className="text-gray-500">{nextSession.type} Session</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Video className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No upcoming sessions</p>
                  <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                    Book a Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Recent Documents</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/client/documents">
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
                
                <div className="flex justify-center pt-2">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>My Therapy Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Sessions</h3>
                  <p className="text-gray-500">View your session history and upcoming appointments</p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/client/sessions">
                    View Sessions
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Notes & Documents</h3>
                  <p className="text-gray-500">Access shared therapy notes and manage your documents</p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/client/documents">
                    View Documents
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">Account Settings</h3>
                  <p className="text-gray-500">Manage your profile and account preferences</p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/client/settings">
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

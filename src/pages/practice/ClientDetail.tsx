
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Calendar, Upload, Edit, Phone, Mail, Video } from 'lucide-react';

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for a client
  const client = {
    id: Number(clientId),
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    dateOfBirth: '1985-06-15',
    emergencyContact: 'John Doe (Husband) - (555) 987-6543',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceId: 'BCBS12345678',
    notes: 'Prefers afternoon appointments. Has anxiety and depression.'
  };

  // Mock data for sessions
  const sessions = [
    { id: 1, date: '2023-05-20', time: '14:00', type: 'Video', status: 'Completed', notes: true },
    { id: 2, date: '2023-05-13', time: '14:00', type: 'In-person', status: 'Completed', notes: true },
    { id: 3, date: '2023-05-06', time: '14:00', type: 'Video', status: 'Completed', notes: true },
    { id: 4, date: '2023-05-27', time: '14:00', type: 'Video', status: 'Scheduled', notes: false },
  ];

  // Mock data for documents
  const documents = [
    { id: 1, name: 'Intake Form.pdf', uploadedDate: '2023-04-30', size: '245 KB' },
    { id: 2, name: 'Insurance Card.jpg', uploadedDate: '2023-04-30', size: '1.2 MB' },
    { id: 3, name: 'Medical History.pdf', uploadedDate: '2023-05-01', size: '380 KB' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-teal-100 text-teal-800">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-sm text-muted-foreground">Client #{client.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 flex items-center">
              <Video className="h-4 w-4 mr-1" /> Start Session
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Personal Information</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Email</h3>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Phone</h3>
                    <p>{client.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Address</h3>
                    <p>{client.address}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Date of Birth</h3>
                    <p>{client.dateOfBirth}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Emergency Contact</h3>
                    <p>{client.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Insurance Information</CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Provider</h3>
                    <p>{client.insuranceProvider}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">ID</h3>
                    <p>{client.insuranceId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Clinician Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{client.notes}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Session History</CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Calendar className="h-4 w-4 mr-2" /> Schedule Session
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                session.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.notes ? (
                              <Link to="#" className="text-teal-600 hover:text-teal-800 hover:underline">
                                View
                              </Link>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {session.status === 'Scheduled' ? (
                              <Link to="#" className="text-teal-600 hover:text-teal-800 hover:underline">
                                Join Session
                              </Link>
                            ) : (
                              <Link to="#" className="text-teal-600 hover:text-teal-800 hover:underline">
                                Add Notes
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Session Notes</CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <FileText className="h-4 w-4 mr-2" /> Create Note
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.filter(s => s.notes).map((session) => (
                    <Card key={session.id}>
                      <CardHeader className="py-3">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm font-medium">
                            Session on {session.date}
                          </CardTitle>
                          <Link to="#" className="text-xs text-teal-600 hover:underline">
                            Edit
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-gray-700">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam 
                          dignissim, justo vel aliquam vestibulum, nibh metus lobortis tellus, 
                          nec gravida nisl risus eget risus.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Documents</CardTitle>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Upload className="h-4 w-4 mr-2" /> Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.uploadedDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <Link to="#" className="text-teal-600 hover:text-teal-800 hover:underline">
                                View
                              </Link>
                              <span className="text-gray-300">|</span>
                              <Link to="#" className="text-teal-600 hover:text-teal-800 hover:underline">
                                Download
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;

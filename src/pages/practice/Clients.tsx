import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal } from 'lucide-react';
import { AddClientDialog } from '@/components/AddClientDialog';
import { ClientResourcesList } from '@/components/practice/ClientResourcesList';

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for clients
  const mockClients = [
    { id: 1, name: 'Jane Doe', email: 'jane@example.com', phone: '(555) 123-4567', status: 'Active', lastSession: '2 days ago' },
    { id: 2, name: 'John Smith', email: 'john@example.com', phone: '(555) 987-6543', status: 'Active', lastSession: '1 week ago' },
    { id: 3, name: 'Emily Johnson', email: 'emily@example.com', phone: '(555) 456-7890', status: 'Inactive', lastSession: '3 weeks ago' },
    { id: 4, name: 'Michael Brown', email: 'michael@example.com', phone: '(555) 789-0123', status: 'Active', lastSession: 'Yesterday' },
    { id: 5, name: 'Sarah Williams', email: 'sarah@example.com', phone: '(555) 234-5678', status: 'Active', lastSession: 'Today' },
  ];

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientAdded = () => {
    // This would normally refresh the client list from the server
    // For now, it's just a placeholder since we're using mock data
    console.log('Client added - would refresh client list here');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <AddClientDialog onClientAdded={handleClientAdded} />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Client List</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Session
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/practice/clients/${client.id}`} className="text-sm font-medium text-teal-700 hover:underline">
                              {client.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                client.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.lastSession}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-gray-500 hover:text-gray-700">
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No clients found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;


import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddClientDialog } from '@/components/AddClientDialog';
import { Users, Search, Plus, Mail, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
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

  // Mock client data
  const clients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      status: 'Active',
      lastSession: '2024-01-15',
      nextSession: '2024-01-22',
      totalSessions: 12
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      status: 'Active',
      lastSession: '2024-01-14',
      nextSession: '2024-01-21',
      totalSessions: 8
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '(555) 345-6789',
      status: 'Inactive',
      lastSession: '2023-12-20',
      nextSession: null,
      totalSessions: 15
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'Active' ? secondaryColor : '#6b7280';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
              Clients
            </h1>
            <p className="text-gray-500">Manage your client list and their information</p>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            style={{ 
              backgroundColor: primaryColor,
              color: 'white'
            }}
            className="hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Users className="h-3 w-3 mr-1" />
                  {filteredClients.length} clients
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg" style={{ color: primaryColor }}>
                    {client.name}
                  </CardTitle>
                  <Badge 
                    variant={client.status === 'Active' ? 'default' : 'secondary'}
                    style={{ 
                      backgroundColor: client.status === 'Active' ? secondaryColor : '#6b7280',
                      color: 'white'
                    }}
                  >
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                    {client.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                    {client.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" style={{ color: secondaryColor }} />
                    {client.totalSessions} sessions
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 mb-2">
                    Last session: {client.lastSession}
                  </div>
                  {client.nextSession && (
                    <div className="text-xs text-gray-500 mb-3">
                      Next session: {client.nextSession}
                    </div>
                  )}
                  <Link to={`/practice/clients/${client.id}`}>
                    <Button 
                      size="sm" 
                      className="w-full"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                      className="hover:opacity-90"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No clients found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first client'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  className="hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <AddClientDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;

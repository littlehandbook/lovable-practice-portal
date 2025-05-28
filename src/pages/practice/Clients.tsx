
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
import { ClientService } from '@/services/ClientService';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Load clients from the database
  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await ClientService.getClients();
      if (error) {
        // Only show error for actual failures, not empty data
        if (error !== 'No clients found') {
          toast({
            title: 'Error',
            description: 'Failed to load clients',
            variant: 'destructive'
          });
        }
        setClients([]);
      } else {
        setClients(data || []);
      }
    } catch (error: any) {
      console.error('Error loading clients:', error);
      // Only show error for actual failures
      const errorMessage = error?.message || 'Unknown error';
      if (!errorMessage.includes('No clients') && !errorMessage.includes('empty')) {
        toast({
          title: 'Error',
          description: 'Failed to load clients',
          variant: 'destructive'
        });
      }
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClientAdded = () => {
    // Refresh the client list when a new client is added
    loadClients();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

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
                    variant="default"
                    style={{ 
                      backgroundColor: secondaryColor,
                      color: 'white'
                    }}
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                      {client.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" style={{ color: secondaryColor }} />
                    Added {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link to={`/practice/clients/${client.id}`}>
                    <Button 
                      size="sm" 
                      className="w-full hover:opacity-90"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && !loading && (
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
          onClientAdded={handleClientAdded}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientsPage;

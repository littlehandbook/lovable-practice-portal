
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientResourcesList } from '@/components/practice/ClientResourcesList';
import { User, Calendar, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { ClientService } from '@/services/ClientService';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { isUUID } from '@/lib/utils';

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId || !isUUID(clientId)) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await ClientService.getClient(clientId);
        
        if (error) {
          console.error('Error fetching client:', error);
          toast({
            title: 'Error',
            description: 'Failed to load client details',
            variant: 'destructive'
          });
          return;
        }

        setClient(data);
      } catch (error) {
        console.error('Unexpected error fetching client:', error);
        toast({
          title: 'Error',
          description: 'Failed to load client details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, toast]);

  if (!clientId || !isUUID(clientId)) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Invalid client ID. Please select a valid client.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading client details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Client not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full">
            <User className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-gray-500">Client Details</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Name
                      </label>
                      <p className="mt-1 text-lg">{client.name}</p>
                    </div>
                    
                    {client.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </label>
                        <p className="mt-1">{client.email}</p>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Phone
                        </label>
                        <p className="mt-1">{client.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {client.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Address
                        </label>
                        <p className="mt-1">{client.address}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Client Since</label>
                      <p className="mt-1">{formatDate(client.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Session management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Notes management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <ClientResourcesList clientId={clientId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;

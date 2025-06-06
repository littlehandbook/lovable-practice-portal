
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EditClientDialog } from '@/components/EditClientDialog';
import { User, Edit } from 'lucide-react';
import { ClientService } from '@/services/ClientService';
import { Client } from '@/models';
import { useToast } from '@/hooks/use-toast';
import { isUUID } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Import tab components
import { ClientOverviewTab } from '@/components/practice/ClientOverviewTab';
import { CombinedSessionNotesTab } from '@/components/practice/CombinedSessionNotesTab';
import { ClientDocumentsTab } from '@/components/practice/ClientDocumentsTab';
import { ClientBillingTab } from '@/components/practice/ClientBillingTab';
import { ClientGoalsTab } from '@/components/ClientGoalsTab'; // Use the working one

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get tenant ID from user metadata
  const tenantId = user?.user_metadata?.tenant_id || user?.id || '';

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId || !isUUID(clientId)) {
        console.log('Invalid client ID:', clientId);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching client:', clientId);
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

        console.log('Client data loaded:', data);
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

  const handleClientUpdated = async () => {
    if (clientId && isUUID(clientId)) {
      try {
        const { data, error } = await ClientService.getClient(clientId);
        if (!error && data) {
          setClient(data);
        }
      } catch (error) {
        console.error('Error refreshing client data:', error);
      }
    }
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-gray-500">Client Details</p>
            </div>
          </div>
          <Button
            onClick={() => setShowEditDialog(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Client
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="sessions">Sessions & Notes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="billing">Billing Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ClientOverviewTab 
              client={client} 
              tenantId={tenantId}
            />
          </TabsContent>

          <TabsContent value="goals">
            <ClientGoalsTab 
              clientId={clientId}
            />
          </TabsContent>

          <TabsContent value="sessions">
            <CombinedSessionNotesTab 
              clientId={clientId}
            />
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Documents functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Billing functionality coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EditClientDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          client={client}
          onClientUpdated={handleClientUpdated}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;

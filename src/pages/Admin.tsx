import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define interfaces for RPC inputs & outputs
interface Tenant {
  tenant_id: string;
  practice_name: string;
  status: string;
  created_at: string;
}

interface AuditLog {
  log_id: string;
  table_name: string;
  operation: string;
  changed_data: any;
  changed_at: string;
}

// RPC-param types
type NoParams = Record<string, never>;
type CreateTenantParams = { p_practice_name: string };
type UpdateStatusParams = { p_tenant_id: string; p_new_status: string };
type FetchAuditLogsParams = { p_tenant_id: string };

const Admin = () => {
  const navigate = useNavigate();
  const [practiceName, setPracticeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [showSchemas, setShowSchemas] = useState(false);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const loadTenants = async () => {
    try {
      // Use the stored procedure sp_get_tenants() with proper typing
      const { data, error } = await supabase.rpc('sp_get_tenants', {});
      
      if (error) throw error;
      // Handle null data case with empty array fallback
      setTenants(data ?? []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load tenants: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Use useEffect instead of useState for side effects
  useEffect(() => {
    loadTenants();
  }, []);  // Empty dependency array means this runs once on mount

  const handleCreateTenant = async () => {
    if (!practiceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a practice name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the stored procedure sp_create_tenant with proper typing
      const { data, error } = await supabase.rpc(
        'sp_create_tenant', 
        { p_practice_name: practiceName }
      );
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Practice "${practiceName}" registered successfully`,
      });
      
      setPracticeName("");
      // If we have data, prepend the new tenant to the list
      if (data && Array.isArray(data) && data.length > 0) {
        setTenants([data[0], ...tenants]);
      } else {
        // Otherwise refresh the entire list
        loadTenants();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create tenant: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusToggle = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      // Use the stored procedure sp_update_tenant_status with proper typing
      const { error } = await supabase.rpc(
        'sp_update_tenant_status',
        { 
          p_tenant_id: tenantId,
          p_new_status: newStatus
        }
      );
        
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Practice status changed to: ${newStatus}`,
      });
      
      loadTenants();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const runIsolationCheck = async () => {
    try {
      const { data, error } = await supabase.rpc('sp_validate_tenant_isolation', {});
      
      if (error) throw error;
      
      toast({
        title: "Isolation Check",
        description: data 
          ? "Tenant isolation is working correctly!" 
          : "WARNING: Tenant isolation check failed!",
        variant: data ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to run isolation check: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EmpathTech Administrator</h1>
        <Button onClick={() => navigate("/")} variant="outline">Back to Home</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Register New Practice</CardTitle>
            <CardDescription>
              Create a new healthcare practice tenant in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="practiceName">Practice Name</Label>
                <Input 
                  id="practiceName" 
                  placeholder="Enter healthcare practice name" 
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleCreateTenant}
              disabled={loading || !practiceName.trim()}
            >
              {loading ? "Creating..." : "Register Practice"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Practices</CardTitle>
            <CardDescription>
              View and manage existing healthcare practices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No practices registered yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <div key={tenant.tenant_id} className="flex justify-between p-3 border rounded-md">
                    <div>
                      <h3 className="font-medium">{tenant.practice_name}</h3>
                      <p className="text-sm text-gray-500">ID: {tenant.tenant_id}</p>
                      <p className="text-xs text-gray-400">Created: {formatDate(tenant.created_at)}</p>
                    </div>
                    <div>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">Manage</Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>{tenant.practice_name}</SheetTitle>
                            <SheetDescription>Practice Details & Management</SheetDescription>
                          </SheetHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-medium">Tenant ID</h4>
                              <p className="text-sm text-gray-500">{tenant.tenant_id}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Status</h4>
                              <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                                tenant.status === 'active' ? 'bg-green-100 text-green-800' : 
                                tenant.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tenant.status}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Created</h4>
                              <p className="text-sm text-gray-500">{formatDate(tenant.created_at)}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Database Schema</h4>
                              <p className="text-sm text-gray-500">tenant_{tenant.tenant_id}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Operations</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Button 
                                  size="sm" 
                                  variant={tenant.status === 'active' ? 'destructive' : 'default'}
                                  onClick={() => handleStatusToggle(tenant.tenant_id, tenant.status)}
                                >
                                  {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/practice/${tenant.tenant_id}`)}
                                >
                                  Access Practice
                                </Button>
                              </div>
                            </div>
                          </div>
                          <SheetFooter>
                            <Button variant="outline" size="sm">Close</Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={runIsolationCheck}
            >
              Test RLS Isolation
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Admin;

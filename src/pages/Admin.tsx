
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();
  const [practiceName, setPracticeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Array<{ tenant_id: string; practice_name: string; status: string }>>([]);
  
  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_tenant_registry')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setTenants(data);
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
      const { data, error } = await supabase.rpc(
        'sp_create_tenant_database', 
        { p_practice_name: practiceName }
      );
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Practice "${practiceName}" registered with tenant ID: ${data}`,
      });
      
      setPracticeName("");
      loadTenants();
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
                    </div>
                    <div>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm">Details</Button>
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
                              <h4 className="text-sm font-medium">Operations</h4>
                              <div className="flex space-x-2 mt-2">
                                <Button size="sm" variant={tenant.status === 'active' ? 'destructive' : 'outline'}>
                                  {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                                </Button>
                                <Button size="sm" variant="outline">Billing</Button>
                                <Button size="sm" variant="outline">Audit Logs</Button>
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
        </Card>
      </div>
    </div>
  );
};

export default Admin;

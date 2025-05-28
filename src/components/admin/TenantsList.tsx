
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { TenantManagement } from "./TenantManagement";
import { validateTenantIsolation, Tenant } from "@/services/tenantService";

interface TenantsListProps {
  tenants: Tenant[];
  onRefreshNeeded: () => void;
}

export const TenantsList = ({ tenants, onRefreshNeeded }: TenantsListProps) => {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const runIsolationCheck = async () => {
    try {
      console.log('Running tenant isolation check via microservice');
      
      const isValid = await validateTenantIsolation();
      
      toast({
        title: "Isolation Check",
        description: isValid 
          ? "Tenant isolation is working correctly!" 
          : "WARNING: Tenant isolation check failed!",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Error running isolation check:', error);
      toast({
        title: "Error",
        description: `Failed to run isolation check: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        Manage
                      </Button>
                    </SheetTrigger>
                    {selectedTenant?.tenant_id === tenant.tenant_id && (
                      <TenantManagement 
                        tenant={tenant}
                        onStatusUpdated={onRefreshNeeded}
                      />
                    )}
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
  );
};

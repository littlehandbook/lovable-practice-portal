
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { TenantCreationForm } from "@/components/admin/TenantCreationForm";
import { TenantsList } from "@/components/admin/TenantsList";
import { listTenants, Tenant } from "@/services/tenantService";

const Admin = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  const loadTenants = async () => {
    try {
      console.log('Loading tenants via microservice');
      
      const data = await listTenants();
      setTenants(data || []);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      toast({
        title: "Error",
        description: `Failed to load tenants: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    loadTenants();
  }, []);

  const handleTenantCreated = (newTenant: Tenant) => {
    setTenants([newTenant, ...tenants]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">EmpathTech Administrator</h1>
        <Button onClick={() => navigate("/")} variant="outline">Back to Home</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <TenantCreationForm onTenantCreated={handleTenantCreated} />
        <TenantsList tenants={tenants} onRefreshNeeded={loadTenants} />
      </div>
    </div>
  );
};

export default Admin;

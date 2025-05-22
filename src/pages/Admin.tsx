
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TenantCreationForm } from "@/components/admin/TenantCreationForm";
import { TenantsList } from "@/components/admin/TenantsList";

// Define interfaces for RPC inputs & outputs
interface Tenant {
  tenant_id: string;
  practice_name: string;
  status: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  const loadTenants = async () => {
    try {
      // Use type assertion to work around the TypeScript constraints
      const { data, error } = await supabase.rpc(
        'sp_get_tenants' as any
      );
      
      if (error) throw error;
      
      // Handle null data case with empty array fallback and type assertion
      setTenants((data as Tenant[]) ?? []);
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

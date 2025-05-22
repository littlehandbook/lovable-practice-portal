
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Tenant {
  tenant_id: string;
  practice_name: string;
  status: string;
  created_at: string;
}

interface TenantManagementProps {
  tenant: Tenant;
  onStatusUpdated: () => void;
}

export const TenantManagement = ({ tenant, onStatusUpdated }: TenantManagementProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleStatusToggle = async () => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabase.rpc(
        'sp_update_tenant_status' as any,
        { 
          p_tenant_id: tenant.tenant_id,
          p_new_status: newStatus
        }
      );
        
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Practice status changed to: ${newStatus}`,
      });
      
      onStatusUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
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
              onClick={handleStatusToggle}
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
  );
};

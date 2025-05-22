
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TenantCreationFormProps {
  onTenantCreated: (tenant: Tenant) => void;
}

interface Tenant {
  tenant_id: string;
  practice_name: string;
  status: string;
  created_at: string;
}

export const TenantCreationForm = ({ onTenantCreated }: TenantCreationFormProps) => {
  const [practiceName, setPracticeName] = useState("");
  const [loading, setLoading] = useState(false);

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
        'sp_create_tenant' as any, 
        { p_practice_name: practiceName }
      );
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: `Practice "${practiceName}" registered successfully`,
      });
      
      setPracticeName("");
      
      // If we have data, pass it to the parent component
      if (data && Array.isArray(data) && data.length > 0) {
        onTenantCreated(data[0] as Tenant);
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

  return (
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
  );
};

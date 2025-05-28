
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Settings } from 'lucide-react';
import { UserService } from '@/service/UserService';
import { UserRole } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

interface RoleManagementTabProps {
  userService: UserService;
  tenantId: string;
  userId: string;
  roles: UserRole[];
  rolesLoading: boolean;
  rolesError: string | null;
  onRoleAdded: () => void;
}

export function RoleManagementTab({ 
  userService, 
  tenantId, 
  userId, 
  roles, 
  rolesLoading, 
  rolesError, 
  onRoleAdded 
}: RoleManagementTabProps) {
  const { toast } = useToast();
  const [addingRole, setAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const addRole = async () => {
    if (!newRoleName) return;

    setAddingRole(true);
    try {
      await userService.createRole(tenantId, newRoleName, newRoleDescription, userId);

      setNewRoleName('');
      setNewRoleDescription('');
      
      onRoleAdded();

      toast({
        title: 'Success',
        description: 'Role created successfully'
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive'
      });
    } finally {
      setAddingRole(false);
    }
  };

  if (rolesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Create New Role</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                disabled={addingRole}
              />
            </div>
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Enter role description"
                disabled={addingRole}
              />
            </div>
            <Button 
              onClick={addRole}
              disabled={!newRoleName || addingRole}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addingRole ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Existing Roles</h3>
          {rolesError && !rolesError.includes('No roles') && !rolesError.includes('empty') ? (
            <div className="text-red-600 bg-red-50 p-3 rounded-md">
              {rolesError}
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No custom roles found</h3>
              <p className="text-gray-400">Create your first custom role above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{role.role_name}</h4>
                      {role.role_description && (
                        <p className="text-sm text-gray-500">{role.role_description}</p>
                      )}
                    </div>
                    {role.is_default && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

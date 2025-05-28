
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { RoleService } from '@/service/RoleService';
import { Role } from '@/types/role';
import { useToast } from '@/hooks/use-toast';

export function NewRoleManagementTab() {
  const { toast } = useToast();
  const roleService = new RoleService();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await roleService.listRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setError('Failed to load roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setAdding(true);
    try {
      const newRole = await roleService.addRole(newRoleName);
      setRoles([newRole, ...roles]);
      setNewRoleName('');
      
      toast({
        title: 'Success',
        description: 'Role created successfully'
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create role',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;

    try {
      const updatedRole = await roleService.updateRole(editingRole.id, editingRole.name);
      setRoles(roles.map(role => role.id === updatedRole.id ? updatedRole : role));
      setEditingRole(null);
      
      toast({
        title: 'Success',
        description: 'Role updated successfully'
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await roleService.deleteRole(id);
      setRoles(roles.filter(role => role.id !== id));
      
      toast({
        title: 'Success',
        description: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading roles...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management (New System)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Role Form */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium">Create New Role</h3>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div>
              <Label htmlFor="newRoleName">Role Name</Label>
              <Input
                id="newRoleName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                disabled={adding}
              />
            </div>
            <Button 
              type="submit"
              disabled={!newRoleName.trim() || adding}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {adding ? 'Creating...' : 'Create Role'}
            </Button>
          </form>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          <h3 className="font-medium">Existing Roles</h3>
          {error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          ) : roles.length === 0 ? (
            <p className="text-gray-500">No roles found.</p>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    {editingRole?.id === role.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleEditRole}>
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingRole(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(role.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingRole({ id: role.id, name: role.name })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
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

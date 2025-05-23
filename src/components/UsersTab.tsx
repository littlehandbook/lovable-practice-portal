
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, User, UserPlus, ShieldCheck } from 'lucide-react';

interface User {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'practitioner';
  created_at: string;
  first_name?: string;
  last_name?: string;
}

interface PagePermission {
  id: string;
  page_path: string;
  page_name: string;
  roles: string[];
}

export function UsersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'practitioner'>('practitioner');

  // Page permissions state
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchUsers();
    fetchPagePermissions();
  }, [tenantId]);

  const fetchUsers = async () => {
    setLoading(true);
    setUsersError(null);
    try {
      const { data, error } = await supabase.rpc('sp_get_tenant_users', {
        p_tenant_id: tenantId
      });

      if (error) {
        console.error('Error fetching users:', error);
        setUsersError('Failed to load users');
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePermissions = async () => {
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      const { data, error } = await supabase.rpc('sp_get_page_permissions', {
        p_tenant_id: tenantId
      });

      if (error) {
        console.error('Error fetching page permissions:', error);
        setPermissionsError('Failed to load page permissions');
        setPagePermissions([]);
      } else {
        setPagePermissions(data || []);
      }
    } catch (error) {
      console.error('Error fetching page permissions:', error);
      setPermissionsError('Failed to load page permissions');
      setPagePermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const addUser = async () => {
    if (!newUserEmail || !newUserFirstName || !newUserLastName || !user) return;

    setAdding(true);
    try {
      // First, check if therapist exists
      const { data: therapistData, error: therapistError } = await supabase.rpc('sp_get_therapist_by_email', {
        p_email: newUserEmail
      });

      if (therapistError) throw therapistError;
      
      let therapistId;
      
      if (!therapistData || therapistData.length === 0) {
        // Create new therapist
        const { data: newTherapist, error: createError } = await supabase.rpc('sp_register_therapist', {
          p_auth_id: crypto.randomUUID(), // This would normally be handled by auth system
          p_email: newUserEmail,
          p_full_name: `${newUserFirstName} ${newUserLastName}`
        });
        
        if (createError) throw createError;
        therapistId = newTherapist;
      } else {
        therapistId = therapistData[0].id;
      }

      // Add user to tenant
      const { error: addError } = await supabase.rpc('sp_add_user_to_tenant', {
        p_user_id: therapistId,
        p_tenant_id: tenantId,
        p_role: newUserRole,
        p_created_by: user.id
      });

      if (addError) throw addError;

      // Clear form
      setNewUserEmail('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserRole('practitioner');
      
      await fetchUsers();

      toast({
        title: 'Success',
        description: 'User added successfully'
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const toggleRolePermission = async (pageId: string, role: string) => {
    try {
      const permission = pagePermissions.find(p => p.id === pageId);
      if (!permission) return;

      const hasRole = permission.roles.includes(role);
      const newRoles = hasRole 
        ? permission.roles.filter(r => r !== role)
        : [...permission.roles, role];

      // Update in database
      const { error } = await supabase.rpc('sp_update_page_permissions', {
        p_tenant_id: tenantId,
        p_page_id: pageId,
        p_allowed_roles: newRoles,
        p_user_id: user?.id || '00000000-0000-0000-0000-000000000000'
      });

      if (error) throw error;

      // Update local state
      setPagePermissions(prevPermissions => 
        prevPermissions.map(page => {
          if (page.id === pageId) {
            return {
              ...page,
              roles: newRoles
            };
          }
          return page;
        })
      );
      
      toast({
        title: 'Permissions Updated',
        description: 'Page permissions have been updated',
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive'
      });
    }
  };

  const saveAllPermissions = async () => {
    try {
      toast({
        title: 'Changes Saved',
        description: 'All page permissions have been saved',
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to save permissions',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid grid-cols-2 w-full max-w-md">
        <TabsTrigger value="users">
          <User className="h-4 w-4 mr-2" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="permissions">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Page Permissions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add new user form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Add New User</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="First name"
                      disabled={adding}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="Last name"
                      disabled={adding}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Enter email address"
                    disabled={adding}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUserRole} 
                    onValueChange={(value: 'admin' | 'practitioner') => setNewUserRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="practitioner">Practitioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={addUser}
                  disabled={!newUserEmail || !newUserFirstName || !newUserLastName || adding}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {adding ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </div>

            {/* Users list */}
            <div className="space-y-4">
              <h3 className="font-medium">Current Users</h3>
              {usersError ? (
                <div className="text-red-600 bg-red-50 p-3 rounded-md">
                  {usersError}
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500">No users found. Add your first user above.</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => (
                        <TableRow key={userData.user_id}>
                          <TableCell>
                            {userData.first_name && userData.last_name 
                              ? `${userData.first_name} ${userData.last_name}`
                              : 'User'}
                          </TableCell>
                          <TableCell>{userData.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              userData.role === 'owner' 
                                ? 'bg-purple-100 text-purple-800'
                                : userData.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {userData.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {userData.role !== 'owner' && (
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            {permissionsLoading ? (
              <p className="text-gray-500">Loading permissions...</p>
            ) : permissionsError ? (
              <div className="text-red-600 bg-red-50 p-3 rounded-md">
                {permissionsError}
              </div>
            ) : pagePermissions.length === 0 ? (
              <p className="text-gray-500">No page permissions configured yet.</p>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-center">Owner</TableHead>
                        <TableHead className="text-center">Admin</TableHead>
                        <TableHead className="text-center">Practitioner</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagePermissions.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-medium">{page.page_name}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <input 
                                type="checkbox" 
                                checked={page.roles.includes('owner')} 
                                onChange={() => toggleRolePermission(page.id, 'owner')}
                                disabled={true} // Owner always has access to everything
                                className="h-4 w-4"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <input 
                                type="checkbox" 
                                checked={page.roles.includes('admin')} 
                                onChange={() => toggleRolePermission(page.id, 'admin')}
                                className="h-4 w-4" 
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <input 
                                type="checkbox" 
                                checked={page.roles.includes('practitioner')} 
                                onChange={() => toggleRolePermission(page.id, 'practitioner')}
                                className="h-4 w-4" 
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={saveAllPermissions}
                  >
                    Save Permissions
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

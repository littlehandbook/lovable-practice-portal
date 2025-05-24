
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

interface UserRole {
  id: string;
  role_name: string;
  role_description: string;
  is_default: boolean;
  created_at: string;
}

interface PagePermission {
  id: string;
  page_path: string;
  page_name: string;
  component_name?: string;
  roles: string[];
}

// Type for database response
interface DatabaseUser {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  first_name: string;
  last_name: string;
}

// Component definitions for different pages
const PAGE_COMPONENTS = {
  '/practice': [
    { name: 'Dashboard Overview', key: 'dashboard_overview' },
    { name: 'Quick Actions', key: 'quick_actions' },
    { name: 'Recent Activity', key: 'recent_activity' }
  ],
  '/practice/clients': [
    { name: 'Client List', key: 'client_list' },
    { name: 'Client Details', key: 'client_details' },
    { name: 'Client Notes', key: 'client_notes' },
    { name: 'Client Goals', key: 'client_goals' },
    { name: 'Add Client', key: 'add_client' }
  ],
  '/practice/settings': [
    { name: 'Profile Settings', key: 'profile_settings' },
    { name: 'User Management', key: 'user_management' },
    { name: 'Role Management', key: 'role_management' },
    { name: 'Page Permissions', key: 'page_permissions' },
    { name: 'Branding', key: 'branding' }
  ],
  '/practice/calendar': [
    { name: 'Calendar View', key: 'calendar_view' },
    { name: 'Session Scheduling', key: 'session_scheduling' },
    { name: 'Session Management', key: 'session_management' }
  ]
};

export function UsersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'practitioner'>('practitioner');

  // Roles state
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [addingRole, setAddingRole] = useState(false);
  
  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  // Page permissions state
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('');
  
  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchUsers();
    fetchRoles();
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
        // Convert database response to properly typed User objects
        const typedUsers: User[] = (data as DatabaseUser[] || []).map(dbUser => ({
          user_id: dbUser.user_id,
          email: dbUser.email,
          role: dbUser.role as 'owner' | 'admin' | 'practitioner',
          created_at: dbUser.created_at,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name
        }));
        setUsers(typedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const { data, error } = await supabase.rpc('sp_get_user_roles', {
        p_tenant_id: tenantId
      });

      if (error) {
        console.error('Error fetching roles:', error);
        setRolesError('Failed to load roles');
        setRoles([]);
      } else {
        setRoles(data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRolesError('Failed to load roles');
      setRoles([]);
    } finally {
      setRolesLoading(false);
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
          p_auth_id: crypto.randomUUID(),
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

  const addRole = async () => {
    if (!newRoleName || !user) return;

    setAddingRole(true);
    try {
      const { error } = await supabase.rpc('sp_upsert_user_role', {
        p_tenant_id: tenantId,
        p_role_name: newRoleName,
        p_role_description: newRoleDescription,
        p_is_default: false,
        p_user_id: user.id
      });

      if (error) throw error;

      // Clear form
      setNewRoleName('');
      setNewRoleDescription('');
      
      await fetchRoles();

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

  const getPagePermissions = (pagePath: string) => {
    return pagePermissions.filter(p => p.page_path === pagePath);
  };

  // Fixed function to provide unique roles without duplication
  const getAvailableRoles = () => {
    const baseRoles = ['owner', 'admin', 'practitioner'];
    const customRoles = roles.map(r => r.role_name);
    
    // Remove duplicates and filter out custom roles that match base roles
    const filteredCustomRoles = customRoles.filter(role => !baseRoles.includes(role));
    
    return [...baseRoles, ...filteredCustomRoles];
  };

  // Get roles for user dropdown (exclude owner)
  const getUserDropdownRoles = () => {
    const baseRoles = ['admin', 'practitioner'];
    const customRoles = roles.map(r => r.role_name).filter(role => !baseRoles.includes(role));
    
    return [...baseRoles, ...customRoles];
  };

  if (loading && rolesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new user form */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Add New User</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4">
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
                        {getUserDropdownRoles().map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
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
            </CardContent>
          </Card>

          {/* Role Management */}
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new role form */}
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

              {/* Existing roles list */}
              <div className="space-y-4">
                <h3 className="font-medium">Existing Roles</h3>
                {rolesError ? (
                  <div className="text-red-600 bg-red-50 p-3 rounded-md">
                    {rolesError}
                  </div>
                ) : roles.length === 0 ? (
                  <p className="text-gray-500">No custom roles created yet.</p>
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
        </div>

        {/* Current Users - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Current Users</CardTitle>
          </CardHeader>
          <CardContent>
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
            ) : (
              <div className="space-y-6">
                {/* Page Selection */}
                <div>
                  <Label htmlFor="pageSelect">Select Page to Configure</Label>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a page to configure permissions" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PAGE_COMPONENTS).map((pagePath) => (
                        <SelectItem key={pagePath} value={pagePath}>
                          {pagePath === '/practice' ? 'Dashboard' :
                           pagePath === '/practice/clients' ? 'Clients' :
                           pagePath === '/practice/settings' ? 'Settings' :
                           pagePath === '/practice/calendar' ? 'Calendar' :
                           pagePath}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Component Permissions for Selected Page */}
                {selectedPage && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          {getAvailableRoles().map(role => (
                            <TableHead key={role} className="text-center">{role}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Page-level permissions */}
                        {getPagePermissions(selectedPage).filter(p => !p.component_name).map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">Page Access</TableCell>
                            {getAvailableRoles().map(role => (
                              <TableCell key={role} className="text-center">
                                <div className="flex justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={page.roles.includes(role)} 
                                    onChange={() => toggleRolePermission(page.id, role)}
                                    disabled={role === 'owner'}
                                    className="h-4 w-4"
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        
                        {/* Component-level permissions */}
                        {PAGE_COMPONENTS[selectedPage as keyof typeof PAGE_COMPONENTS]?.map((component) => {
                          const componentPermission = getPagePermissions(selectedPage).find(p => p.component_name === component.key);
                          return (
                            <TableRow key={component.key}>
                              <TableCell className="font-medium pl-8">└ {component.name}</TableCell>
                              {getAvailableRoles().map(role => (
                                <TableCell key={role} className="text-center">
                                  <div className="flex justify-center">
                                    <input 
                                      type="checkbox" 
                                      checked={componentPermission?.roles.includes(role) || false}
                                      onChange={() => {
                                        if (componentPermission) {
                                          toggleRolePermission(componentPermission.id, role);
                                        }
                                      }}
                                      disabled={role === 'owner' || !componentPermission}
                                      className="h-4 w-4"
                                    />
                                  </div>
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* All Pages Overview */}
                {!selectedPage && pagePermissions.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          {getAvailableRoles().map(role => (
                            <TableHead key={role} className="text-center">{role}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagePermissions.filter(p => !p.component_name).map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-medium">{page.page_name}</TableCell>
                            {getAvailableRoles().map(role => (
                              <TableCell key={role} className="text-center">
                                <div className="flex justify-center">
                                  <input 
                                    type="checkbox" 
                                    checked={page.roles.includes(role)} 
                                    onChange={() => toggleRolePermission(page.id, role)}
                                    disabled={role === 'owner'}
                                    className="h-4 w-4"
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

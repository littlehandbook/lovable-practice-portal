
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, ShieldCheck, Settings } from 'lucide-react';
import { UserService } from '@/service/UserService';
import { User as UserType, UserRole, PagePermission } from '@/types/user';
import { UserManagementTab } from './users/UserManagementTab';
import { RoleManagementTab } from './users/RoleManagementTab';
import { NewRoleManagementTab } from './users/NewRoleManagementTab';
import { CurrentUsersTable } from './users/CurrentUsersTable';
import { PagePermissionsTab } from './users/PagePermissionsTab';

export function UsersTab() {
  const { user } = useAuth();
  const userService = new UserService();
  
  // Users state
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Roles state
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Page permissions state
  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
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
      const userData = await userService.listTenantUsers(tenantId);
      setUsers(userData);
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
      const rolesData = await userService.listUserRoles(tenantId);
      setRoles(rolesData);
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
      const permissionsData = await userService.listPagePermissions(tenantId);
      setPagePermissions(permissionsData);
    } catch (error) {
      console.error('Error fetching page permissions:', error);
      setPermissionsError('Failed to load page permissions');
      setPagePermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Authentication required</p>
      </div>
    );
  }

  if (loading && rolesLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md">
        <TabsTrigger value="users">
          <User className="h-4 w-4 mr-2" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="roles">
          <Settings className="h-4 w-4 mr-2" />
          Role Management
        </TabsTrigger>
        <TabsTrigger value="permissions">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Page Permissions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserManagementTab
            userService={userService}
            tenantId={tenantId}
            userId={user.id}
            roles={roles}
            onUserAdded={fetchUsers}
          />

          <RoleManagementTab
            userService={userService}
            tenantId={tenantId}
            userId={user.id}
            roles={roles}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
            onRoleAdded={fetchRoles}
          />
        </div>

        <CurrentUsersTable
          users={users}
          loading={loading}
          error={usersError}
        />
      </TabsContent>

      <TabsContent value="roles" className="space-y-6">
        <NewRoleManagementTab />
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        <PagePermissionsTab
          userService={userService}
          tenantId={tenantId}
          userId={user?.id || ''}
          roles={roles}
          pagePermissions={pagePermissions}
          permissionsLoading={permissionsLoading}
          permissionsError={permissionsError}
          onPermissionsUpdate={fetchPagePermissions}
        />
      </TabsContent>
    </Tabs>
  );
}

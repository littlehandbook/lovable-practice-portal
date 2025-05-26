
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserService } from '@/service/UserService';
import { UserRole, PagePermission } from '@/repository/UserRepository';
import { useToast } from '@/hooks/use-toast';

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

interface PagePermissionsTabProps {
  userService: UserService;
  tenantId: string; // Now UUID string
  userId: string;
  roles: UserRole[];
  pagePermissions: PagePermission[];
  permissionsLoading: boolean;
  permissionsError: string | null;
  onPermissionsUpdate: () => void;
}

export function PagePermissionsTab({
  userService,
  tenantId,
  userId,
  roles,
  pagePermissions,
  permissionsLoading,
  permissionsError,
  onPermissionsUpdate
}: PagePermissionsTabProps) {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string>('');

  const toggleRolePermission = async (pageId: string, role: string) => {
    try {
      const permission = pagePermissions.find(p => p.id === pageId);
      if (!permission) return;

      const newRoles = await userService.updatePermissions(
        tenantId, // UUID string
        pageId,
        role,
        permission.roles,
        userId
      );

      // Update local state
      const updatedPermissions = pagePermissions.map(page => {
        if (page.id === pageId) {
          return { ...page, roles: newRoles };
        }
        return page;
      });
      
      // This is a bit of a hack - we should ideally pass a setter function
      // but for now we'll trigger a refetch
      onPermissionsUpdate();
      
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

  const getAvailableRoles = () => {
    return userService.getAvailableRoles(roles);
  };

  if (permissionsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading permissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (permissionsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 bg-red-50 p-3 rounded-md">
            {permissionsError}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Permissions</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}


import { User, UserRole, PagePermission } from '@/types/user';

export class UserService {
  private apiUrl = '/api/users';

  async listTenantUsers(tenantId: string): Promise<User[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const response = await fetch(`${this.apiUrl}/tenant/${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return response.json();
  }

  async listUserRoles(tenantId: string): Promise<UserRole[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const response = await fetch(`/api/user-roles?tenantId=${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user roles: ${response.statusText}`);
    }
    return response.json();
  }

  async listPagePermissions(tenantId: string): Promise<PagePermission[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    
    const response = await fetch(`/api/page-permissions?tenantId=${tenantId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch page permissions: ${response.statusText}`);
    }
    return response.json();
  }

  async addUser(
    email: string, 
    firstName: string, 
    lastName: string, 
    role: 'admin' | 'practitioner',
    tenantId: string,
    createdBy: string
  ): Promise<void> {
    if (!email || !firstName || !lastName) {
      throw new Error('Email, first name, and last name are required');
    }

    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        role,
        tenantId,
        createdBy,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to add user');
    }
  }

  async createRole(
    tenantId: string,
    roleName: string,
    roleDescription: string,
    userId: string
  ): Promise<string> {
    if (!roleName.trim()) {
      throw new Error('Role name is required');
    }

    const response = await fetch('/api/user-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        roleName,
        roleDescription,
        userId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create role');
    }

    const result = await response.json();
    return result.id;
  }

  async updatePermissions(
    tenantId: string,
    pageId: string,
    role: string,
    currentRoles: string[],
    userId: string
  ): Promise<string[]> {
    const hasRole = currentRoles.includes(role);
    const newRoles = hasRole 
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];

    const response = await fetch(`/api/page-permissions/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        roles: newRoles,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update permissions: ${response.statusText}`);
    }

    return newRoles;
  }

  getAvailableRoles(customRoles: UserRole[]): string[] {
    const baseRoles = ['owner', 'admin', 'practitioner'];
    const customRoleNames = customRoles
      .map(r => r.role_name)
      .filter(role => !baseRoles.includes(role));
    
    return [...baseRoles, ...customRoleNames];
  }

  getUserDropdownRoles(customRoles: UserRole[]): string[] {
    const baseRoles = ['admin', 'practitioner'];
    const customRoleNames = customRoles
      .map(r => r.role_name)
      .filter(role => !baseRoles.includes(role));
    
    return [...baseRoles, ...customRoleNames];
  }
}

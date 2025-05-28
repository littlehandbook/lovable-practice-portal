
// src/services/roleService.ts

const API_BASE_URL = '/api'; // Use Vite proxy to microservices

export interface UserRole {
  id: string;
  role_name: string;
  role_description?: string;
  tenant_id: string;
  is_default?: boolean;
}

export interface RolePayload {
  role_name: string;
  role_description?: string;
  tenant_id: string;
  is_default?: boolean;
}

export async function upsertUserRole(userId: string, roleData: RolePayload): Promise<UserRole> {
  const res = await fetch(`${API_BASE_URL}/user-roles/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(roleData),
  });
  
  if (!res.ok) throw new Error(`Error upserting user role: ${res.statusText}`);
  return res.json();
}

export async function fetchUserRoles(tenantId: string): Promise<UserRole[]> {
  const res = await fetch(`${API_BASE_URL}/user-roles?tenantId=${tenantId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Error fetching user roles: ${res.statusText}`);
  }
  
  return res.json();
}

export async function deleteUserRole(roleId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/user-roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) throw new Error(`Error deleting user role: ${res.statusText}`);
}

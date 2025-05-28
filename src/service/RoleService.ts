
import { Role } from '@/types/role';

export class RoleService {
  private apiUrl = '/api/roles';

  async listRoles(): Promise<Role[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }
    return response.json();
  }

  async addRole(name: string): Promise<Role> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Role name cannot be empty');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: trimmedName }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create role');
    }

    return response.json();
  }

  async updateRole(id: string, name: string): Promise<Role> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Role name cannot be empty');
    }

    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: trimmedName }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update role');
    }

    return response.json();
  }

  async deleteRole(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.statusText}`);
    }
  }
}

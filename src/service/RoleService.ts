
import { RoleRepository, Role } from '@/repository/RoleRepository';

export class RoleService {
  constructor(private repo = new RoleRepository()) {}

  async listRoles(): Promise<Role[]> {
    const roles = await this.repo.findAll();
    return roles;
  }

  async addRole(name: string): Promise<Role> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Role name cannot be empty');
    }

    // Check if role already exists
    const existingRole = await this.repo.findByName(trimmedName);
    if (existingRole) {
      throw new Error('Role name already exists');
    }

    return this.repo.create(trimmedName);
  }

  async updateRole(id: string, name: string): Promise<Role> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Role name cannot be empty');
    }

    // Check if another role with this name exists
    const existingRole = await this.repo.findByName(trimmedName);
    if (existingRole && existingRole.id !== id) {
      throw new Error('Role name already exists');
    }

    return this.repo.update(id, trimmedName);
  }

  async deleteRole(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

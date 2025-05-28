
import { Role } from '@/types/role';
import { RoleService } from './RoleService';
import { trackApiPerformance, withErrorTracking } from '@/utils/monitoring';

export class MonitoredRoleService extends RoleService {
  async listRoles(): Promise<Role[]> {
    return trackApiPerformance(
      withErrorTracking(super.listRoles.bind(this), { action: 'list_roles' }),
      '/api/roles',
      'GET'
    )();
  }

  async addRole(name: string): Promise<Role> {
    return trackApiPerformance(
      withErrorTracking(super.addRole.bind(this), { action: 'add_role' }),
      '/api/roles',
      'POST'
    )(name);
  }

  async updateRole(id: string, name: string): Promise<Role> {
    return trackApiPerformance(
      withErrorTracking(super.updateRole.bind(this), { action: 'update_role' }),
      `/api/roles/${id}`,
      'PUT'
    )(id, name);
  }

  async deleteRole(id: string): Promise<void> {
    return trackApiPerformance(
      withErrorTracking(super.deleteRole.bind(this), { action: 'delete_role' }),
      `/api/roles/${id}`,
      'DELETE'
    )(id);
  }
}

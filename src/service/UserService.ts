
import { UserRepository, User, UserRole, PagePermission } from '@/repository/UserRepository';

export class UserService {
  constructor(private repo = new UserRepository()) {}

  async listTenantUsers(tenantId: string): Promise<User[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.repo.getTenantUsers(tenantId);
  }

  async listUserRoles(tenantId: string): Promise<UserRole[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.repo.getUserRoles(tenantId);
  }

  async listPagePermissions(tenantId: string): Promise<PagePermission[]> {
    if (!tenantId) throw new Error('Tenant ID is required');
    return this.repo.getPagePermissions(tenantId);
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

    const fullName = `${firstName} ${lastName}`;
    
    // Check if therapist exists
    const existingTherapist = await this.repo.getTherapistByEmail(email);
    
    let therapistId;
    if (!existingTherapist || existingTherapist.length === 0) {
      // Create new therapist
      therapistId = await this.repo.registerTherapist(
        crypto.randomUUID(),
        email,
        fullName
      );
    } else {
      therapistId = existingTherapist[0].id;
    }

    // Add user to tenant
    await this.repo.addUserToTenant(therapistId, tenantId, role, createdBy);
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

    return this.repo.createUserRole(tenantId, roleName, roleDescription, userId);
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

    await this.repo.updatePagePermissions(tenantId, pageId, newRoles, userId);
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

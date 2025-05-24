
import { supabase } from '@/integrations/supabase/client';

export interface User {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'practitioner';
  created_at: string;
  first_name?: string;
  last_name?: string;
}

export interface UserRole {
  id: string;
  role_name: string;
  role_description: string;
  is_default: boolean;
  created_at: string;
}

export interface PagePermission {
  id: string;
  page_path: string;
  page_name: string;
  component_name?: string;
  roles: string[];
}

export class UserRepository {
  async getTenantUsers(tenantId: string): Promise<User[]> {
    const { data, error } = await supabase.rpc('sp_get_tenant_users', {
      p_tenant_id: tenantId
    });

    if (error) throw error;
    
    return (data || []).map(dbUser => ({
      user_id: dbUser.user_id,
      email: dbUser.email,
      role: dbUser.role as 'owner' | 'admin' | 'practitioner',
      created_at: dbUser.created_at,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name
    }));
  }

  async getUserRoles(tenantId: string): Promise<UserRole[]> {
    const { data, error } = await supabase.rpc('sp_get_user_roles', {
      p_tenant_id: tenantId
    });

    if (error) throw error;
    return data || [];
  }

  async getPagePermissions(tenantId: string): Promise<PagePermission[]> {
    const { data, error } = await supabase.rpc('sp_get_page_permissions', {
      p_tenant_id: tenantId
    });

    if (error) throw error;
    return data || [];
  }

  async addUserToTenant(userId: string, tenantId: string, role: string, createdBy: string): Promise<void> {
    const { error } = await supabase.rpc('sp_add_user_to_tenant', {
      p_user_id: userId,
      p_tenant_id: tenantId,
      p_role: role,
      p_created_by: createdBy
    });

    if (error) throw error;
  }

  async createUserRole(tenantId: string, roleName: string, roleDescription: string, userId: string): Promise<string> {
    const { data, error } = await supabase.rpc('sp_upsert_user_role', {
      p_tenant_id: tenantId,
      p_role_name: roleName,
      p_role_description: roleDescription,
      p_is_default: false,
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  async updatePagePermissions(tenantId: string, pageId: string, allowedRoles: string[], userId: string): Promise<void> {
    const { error } = await supabase.rpc('sp_update_page_permissions', {
      p_tenant_id: tenantId,
      p_page_id: pageId,
      p_allowed_roles: allowedRoles,
      p_user_id: userId
    });

    if (error) throw error;
  }

  async getTherapistByEmail(email: string) {
    const { data, error } = await supabase.rpc('sp_get_therapist_by_email', {
      p_email: email
    });

    if (error) throw error;
    return data;
  }

  async registerTherapist(authId: string, email: string, fullName: string) {
    const { data, error } = await supabase.rpc('sp_register_therapist', {
      p_auth_id: authId,
      p_email: email,
      p_full_name: fullName
    });

    if (error) throw error;
    return data;
  }
}

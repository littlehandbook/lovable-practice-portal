
import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class RoleRepository {
  async findAll(): Promise<Role[]> {
    // Use rpc call to bypass TypeScript type issues until DB types are regenerated
    const { data, error } = await supabase.rpc('get_all_roles' as any);
    
    if (error) throw error;
    return data || [];
  }

  async create(name: string): Promise<Role> {
    const { data, error } = await supabase.rpc('create_role' as any, { role_name: name });
    
    if (error) throw error;
    return data;
  }

  async findByName(name: string): Promise<Role | null> {
    const { data, error } = await supabase.rpc('find_role_by_name' as any, { role_name: name });
    
    if (error) throw error;
    return data;
  }

  async update(id: string, name: string): Promise<Role> {
    const { data, error } = await supabase.rpc('update_role' as any, { role_id: id, role_name: name });
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_role' as any, { role_id: id });
    
    if (error) throw error;
  }
}

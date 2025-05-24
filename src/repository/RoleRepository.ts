
import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class RoleRepository {
  async findAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, created_at, updated_at')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async create(name: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async findByName(name: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, created_at, updated_at')
      .eq('name', name)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, name: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

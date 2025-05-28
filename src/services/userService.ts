
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  practice_name?: string;
  license_number?: string;
  is_active: boolean;
  tenant_id?: string;
}

export interface UserPayload {
  full_name?: string;
  phone?: string;
  practice_name?: string;
  license_number?: string;
  is_active?: boolean;
}

export async function upsertUser(userId: string, userData: UserPayload): Promise<User> {
  console.log('User upsert feature not yet implemented via microservice');
  throw new Error('User management microservice not yet implemented');
}

export async function fetchUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return null;
  }
}

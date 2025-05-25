
import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  insurance_provider?: string;
  insurance_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class ClientService {
  static async getClients(): Promise<{ data: Client[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients')
        .select('*')
        .order('name');

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async getClient(clientId: string): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_clients')
        .insert({
          ...clientData,
          tenant_id: user.user_metadata?.tenant_id,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async updateClient(clientId: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_clients')
        .update({
          ...clientData,
          updated_by: user.id
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}

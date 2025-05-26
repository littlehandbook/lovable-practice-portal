
import { supabase } from '@/integrations/supabase/client';
import { Client, ServiceError } from '@/models';

export class ClientService {
  static async getClients(): Promise<{ data: Client[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error in getClients:', error);
        return { data: [], error: error.message };
      }

      const clients = (data || []) as Client[];
      return { data: clients, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClients:', error);
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
        console.error('Supabase error in getClient:', error);
        return { data: null, error: error.message };
      }

      const client = data as Client;
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClient:', error);
      return { data: null, error: error.message };
    }
  }

  static async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      console.log('Creating client with user:', user);
      
      // Get tenant_id from JWT claims or user metadata
      const tenantId = user.user_metadata?.tenant_id;
      
      const { data, error } = await supabase
        .from('tbl_clients')
        .insert({
          ...clientData,
          tenant_id: tenantId,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createClient:', error);
        return { data: null, error: error.message };
      }

      console.log('Client created successfully:', data);
      const client = data as Client;
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createClient:', error);
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
        console.error('Supabase error in updateClient:', error);
        return { data: null, error: error.message };
      }

      const client = data as Client;
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateClient:', error);
      return { data: null, error: error.message };
    }
  }
}

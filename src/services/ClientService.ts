
import { Client } from '@/models';
import { ApiClient } from '@/utils/apiClient';

export class ClientService {
  static async getClients(): Promise<{ data: Client[]; error: string | null }> {
    const response = await ApiClient.get<Client[]>('/clients');
    return {
      data: response.data || [],
      error: response.error
    };
  }

  static async getClient(clientId: string): Promise<{ data: Client | null; error: string | null }> {
    return await ApiClient.get<Client>(`/clients/${clientId}`);
  }

  static async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null; error: string | null }> {
    return await ApiClient.post<Client>('/clients', clientData);
  }

  static async updateClient(clientId: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Client | null; error: string | null }> {
    return await ApiClient.put<Client>(`/clients/${clientId}`, clientData);
  }
}

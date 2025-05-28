
import { Client, ServiceError } from '@/models';

const API_BASE_URL = '/api';

export class ClientService {
  static async getClients(): Promise<{ data: Client[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch clients: ${res.statusText}` };
      }

      const clients = await res.json();
      return { data: clients, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClients:', error);
      return { data: [], error: error.message };
    }
  }

  static async getClient(clientId: string): Promise<{ data: Client | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: null, error: `Failed to fetch client: ${res.statusText}` };
      }

      const client = await res.json();
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClient:', error);
      return { data: null, error: error.message };
    }
  }

  static async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create client: ${res.statusText}` };
      }

      const client = await res.json();
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createClient:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateClient(clientId: string, clientData: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Client | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to update client: ${res.statusText}` };
      }

      const client = await res.json();
      return { data: client, error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateClient:', error);
      return { data: null, error: error.message };
    }
  }
}

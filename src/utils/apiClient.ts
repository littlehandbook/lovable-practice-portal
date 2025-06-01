import { supabase } from '@/integrations/supabase/client';

// Use environment variable for API base URL, fallback to dev proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export class ApiClient {
  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  }

  private static getServiceUrl(endpoint: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Map endpoints to their respective services
    if (endpoint.startsWith('/clients')) {
      return `${baseUrl}/clients-service${endpoint}`;
    }
    if (endpoint.startsWith('/documents')) {
      return `${baseUrl}/documents-service${endpoint}`;
    }
    if (endpoint.startsWith('/client-journal')) {
      return `${baseUrl}/client-journal-service${endpoint}`;
    }
    if (endpoint.startsWith('/client-resources')) {
      return `${baseUrl}/client-resources-service${endpoint}`;
    }
    
    // Default fallback
    return `${baseUrl}${endpoint}`;
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        return { data: null, error: `Request failed: ${res.statusText}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (error: any) {
      console.error(`GET ${endpoint} error:`, error);
      return { data: null, error: error.message };
    }
  }

  static async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        return { data: null, error: `Request failed: ${res.statusText}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (error: any) {
      console.error(`POST ${endpoint} error:`, error);
      return { data: null, error: error.message };
    }
  }

  static async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'PUT',
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        return { data: null, error: `Request failed: ${res.statusText}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (error: any) {
      console.error(`PUT ${endpoint} error:`, error);
      return { data: null, error: error.message };
    }
  }

  static async delete(endpoint: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers
      });

      if (!res.ok) {
        return { error: `Request failed: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error(`DELETE ${endpoint} error:`, error);
      return { error: error.message };
    }
  }

  static async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!res.ok) {
        return { data: null, error: `Request failed: ${res.statusText}` };
      }

      const data = await res.json();
      return { data, error: null };
    } catch (error: any) {
      console.error(`POST FormData ${endpoint} error:`, error);
      return { data: null, error: error.message };
    }
  }

  static async getBlob(endpoint: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const url = this.getServiceUrl(endpoint);
      
      const res = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        return { data: null, error: `Request failed: ${res.statusText}` };
      }

      const blob = await res.blob();
      return { data: blob, error: null };
    } catch (error: any) {
      console.error(`GET Blob ${endpoint} error:`, error);
      return { data: null, error: error.message };
    }
  }
}

import { supabase } from '@/integrations/supabase/client';

// Environment-based URL configuration
const getApiBaseUrl = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost') {
    return '/api'; // Uses vite proxy to localhost:3001
  }
  
  // Check if we're on Lovable preview domain
  if (window.location.hostname.includes('lovable.app')) {
    return 'https://your-preview-microservice-url.lovable.app';
  }
  
  // Production domain
  return 'https://your-production-api-url.com';
};

const API_BASE_URL = getApiBaseUrl();

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

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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

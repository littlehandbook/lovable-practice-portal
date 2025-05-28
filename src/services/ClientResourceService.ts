
import { ClientResource, CreateResourceInput } from '@/models/ClientResource';

const API_BASE_URL = '/api';

export class ClientResourceService {
  static async createResource(input: CreateResourceInput): Promise<{ data: ClientResource | null; error: string | null }> {
    try {
      console.log('Creating resource via microservice');

      const formData = new FormData();
      formData.append('client_id', input.client_id);
      formData.append('resource_type', input.resource_type);
      formData.append('title', input.title);
      formData.append('description', input.description || '');
      
      if (input.resource_type === 'url' && input.url) {
        formData.append('url', input.url);
      }
      
      if (input.resource_type === 'document' && input.file) {
        formData.append('file', input.file);
      }

      const res = await fetch(`${API_BASE_URL}/client-resources`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create resource: ${res.statusText}` };
      }

      const resource = await res.json();
      return { data: resource, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createResource:', error);
      return { data: null, error: error.message };
    }
  }

  static async getClientResources(clientId: string): Promise<{ data: ClientResource[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-resources?client_id=${clientId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch resources: ${res.statusText}` };
      }

      const resources = await res.json();
      return { data: resources, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientResources:', error);
      return { data: [], error: error.message };
    }
  }

  static async downloadResource(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-resources/download?file_path=${encodeURIComponent(filePath)}`, {
        method: 'GET'
      });

      if (!res.ok) {
        return { data: null, error: `Failed to download resource: ${res.statusText}` };
      }

      const blob = await res.blob();
      return { data: blob, error: null };
    } catch (error: any) {
      console.error('Unexpected error in downloadResource:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteResource(resourceId: string): Promise<{ error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { error: `Failed to delete resource: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteResource:', error);
      return { error: error.message };
    }
  }
}

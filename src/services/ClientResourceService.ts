
import { ClientResource, CreateResourceInput } from '@/models/ClientResource';
import { ApiClient } from '@/utils/apiClient';

export class ClientResourceService {
  static async createResource(input: CreateResourceInput): Promise<{ data: ClientResource | null; error: string | null }> {
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

    return await ApiClient.postFormData<ClientResource>('/client-resources', formData);
  }

  static async getClientResources(clientId: string): Promise<{ data: ClientResource[]; error: string | null }> {
    const response = await ApiClient.get<ClientResource[]>(`/client-resources?client_id=${clientId}`);
    return {
      data: response.data || [],
      error: response.error
    };
  }

  static async downloadResource(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    return await ApiClient.getBlob(`/client-resources/download?file_path=${encodeURIComponent(filePath)}`);
  }

  static async deleteResource(resourceId: string): Promise<{ error: string | null }> {
    return await ApiClient.delete(`/client-resources/${resourceId}`);
  }
}

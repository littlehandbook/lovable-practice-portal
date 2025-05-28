
import { DocumentRecord } from '@/models';
import { ApiClient } from '@/utils/apiClient';

export class DocumentService {
  static async uploadDocument(
    file: File, 
    clientId?: string, 
    documentType: DocumentRecord['document_type'] = 'client_upload'
  ): Promise<{ data: DocumentRecord | null; error: string | null }> {
    console.log('Uploading document via microservice');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    if (clientId) {
      formData.append('client_id', clientId);
    }

    return await ApiClient.postFormData<DocumentRecord>('/documents/upload', formData);
  }

  static async getClientDocuments(clientId?: string): Promise<{ data: DocumentRecord[]; error: string | null }> {
    const endpoint = clientId 
      ? `/documents?client_id=${clientId}`
      : '/documents';

    const response = await ApiClient.get<DocumentRecord[]>(endpoint);
    return {
      data: response.data || [],
      error: response.error
    };
  }

  static async downloadDocument(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    return await ApiClient.getBlob(`/documents/download?file_path=${encodeURIComponent(filePath)}`);
  }

  static async deleteDocument(documentId: string): Promise<{ error: string | null }> {
    return await ApiClient.delete(`/documents/${documentId}`);
  }
}


import { DocumentRecord, ServiceError } from '@/models';

const API_BASE_URL = '/api';

export class DocumentService {
  static async uploadDocument(
    file: File, 
    clientId?: string, 
    documentType: DocumentRecord['document_type'] = 'client_upload'
  ): Promise<{ data: DocumentRecord | null; error: string | null }> {
    try {
      console.log('Uploading document via microservice');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      
      if (clientId) {
        formData.append('client_id', clientId);
      }

      const res = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        return { data: null, error: `Document upload failed: ${res.statusText}` };
      }

      const document = await res.json();
      return { data: document, error: null };
    } catch (error: any) {
      console.error('Unexpected error in uploadDocument:', error);
      return { data: null, error: error.message };
    }
  }

  static async getClientDocuments(clientId?: string): Promise<{ data: DocumentRecord[]; error: string | null }> {
    try {
      const url = clientId 
        ? `${API_BASE_URL}/documents?client_id=${clientId}`
        : `${API_BASE_URL}/documents`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch documents: ${res.statusText}` };
      }

      const documents = await res.json();
      return { data: documents, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientDocuments:', error);
      return { data: [], error: error.message };
    }
  }

  static async downloadDocument(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/download?file_path=${encodeURIComponent(filePath)}`, {
        method: 'GET'
      });

      if (!res.ok) {
        return { data: null, error: `Document download failed: ${res.statusText}` };
      }

      const blob = await res.blob();
      return { data: blob, error: null };
    } catch (error: any) {
      console.error('Unexpected error in downloadDocument:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteDocument(documentId: string): Promise<{ error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { error: `Document deletion failed: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteDocument:', error);
      return { error: error.message };
    }
  }
}

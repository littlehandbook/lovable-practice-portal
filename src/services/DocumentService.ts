
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  document_type: 'client_upload' | 'session_notes' | 'treatment_plan' | 'assessment';
  is_shared_with_client: boolean;
  created_at: string;
  client_id?: string;
  therapist_id?: string;
}

export class DocumentService {
  static async uploadDocument(
    file: File, 
    clientId?: string, 
    documentType: Document['document_type'] = 'client_upload'
  ): Promise<{ data: Document | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        return { data: null, error: uploadError.message };
      }

      // Insert document record
      const { data: docData, error: docError } = await supabase
        .from('tbl_documents')
        .insert({
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          document_type: documentType,
          client_id: clientId,
          uploaded_by: user.id,
          tenant_id: user.user_metadata?.tenant_id,
          is_shared_with_client: documentType === 'client_upload'
        })
        .select()
        .single();

      if (docError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([uploadData.path]);
        return { data: null, error: docError.message };
      }

      return { data: docData, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async getClientDocuments(clientId?: string): Promise<{ data: Document[]; error: string | null }> {
    try {
      let query = supabase
        .from('tbl_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async downloadDocument(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async deleteDocument(documentId: string): Promise<{ error: string | null }> {
    try {
      // Get document to find file path
      const { data: doc, error: fetchError } = await supabase
        .from('tbl_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        return { error: fetchError.message };
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('tbl_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        return { error: dbError.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

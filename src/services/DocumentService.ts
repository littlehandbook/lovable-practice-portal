
import { supabase } from '@/integrations/supabase/client';
import { DocumentRecord, ServiceError } from '@/models';
import { isUUID } from '@/lib/utils';

export class DocumentService {
  static async uploadDocument(
    file: File, 
    clientId?: string, 
    documentType: DocumentRecord['document_type'] = 'client_upload'
  ): Promise<{ data: DocumentRecord | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Get tenant_id from JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      const tenantId = session?.user?.user_metadata?.tenant_id || user.user_metadata?.tenant_id;
      
      // Validate required UUIDs
      if (!isUUID(user.id)) {
        return { data: null, error: 'Invalid user ID format' };
      }

      if (tenantId && !isUUID(tenantId)) {
        return { data: null, error: 'Invalid tenant ID format' };
      }

      if (clientId && !isUUID(clientId)) {
        return { data: null, error: 'Invalid client ID format' };
      }

      // Create tenant-isolated file path: tenant_id/user_id/filename (if tenant exists)
      const fileExt = file.name.split('.').pop();
      const fileName = tenantId 
        ? `${tenantId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        : `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { data: null, error: uploadError.message };
      }

      // Insert document record with all required fields for RLS
      const insertData: any = {
        name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        uploaded_by: user.id, // This MUST match auth.uid() for RLS
        is_shared_with_client: documentType === 'client_upload'
      };

      // Only include client_id if it's a valid UUID
      if (clientId && isUUID(clientId)) {
        insertData.client_id = clientId;
      }

      // Only include tenant_id if it's a valid UUID
      if (tenantId && isUUID(tenantId)) {
        insertData.tenant_id = tenantId;
        insertData.therapist_id = user.id;
      }

      const { data: docData, error: docError } = await supabase
        .from('tbl_documents' as any)
        .insert(insertData)
        .select()
        .single();

      if (docError) {
        console.error('Database insert error:', docError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([uploadData.path]);
        return { data: null, error: docError.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const document = docData as unknown as DocumentRecord;
      return { data: document, error: null };
    } catch (error: any) {
      console.error('Unexpected error in uploadDocument:', error);
      return { data: null, error: error.message };
    }
  }

  static async getClientDocuments(clientId?: string): Promise<{ data: DocumentRecord[]; error: string | null }> {
    try {
      let query = supabase
        .from('tbl_documents' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error in getClientDocuments:', error);
        return { data: [], error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const documents = (data || []) as unknown as DocumentRecord[];
      return { data: documents, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientDocuments:', error);
      return { data: [], error: error.message };
    }
  }

  static async downloadDocument(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) {
        console.error('Storage download error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error in downloadDocument:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteDocument(documentId: string): Promise<{ error: string | null }> {
    try {
      // Get document to find file path
      const { data: doc, error: fetchError } = await supabase
        .from('tbl_documents' as any)
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('Error fetching document for deletion:', fetchError);
        return { error: fetchError.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const docData = doc as unknown as { file_path: string };

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('tbl_documents' as any)
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        return { error: dbError.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteDocument:', error);
      return { error: error.message };
    }
  }
}

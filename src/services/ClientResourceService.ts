
import { supabase } from '@/integrations/supabase/client';
import { ClientResource, CreateResourceInput } from '@/models/ClientResource';
import { isUUID } from '@/lib/utils';

export class ClientResourceService {
  static async createResource(input: CreateResourceInput): Promise<{ data: ClientResource | null; error: string | null }> {
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

      if (!isUUID(input.client_id)) {
        return { data: null, error: 'Invalid client ID format' };
      }

      let file_path = null;
      let file_size = null;
      let mime_type = null;

      // Handle file upload for document type
      if (input.resource_type === 'document' && input.file) {
        const fileExt = input.file.name.split('.').pop();
        // Use tenant-isolated file structure: tenant_id/user_id/filename (if tenant exists)
        const fileName = tenantId 
          ? `${tenantId}/${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          : `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, input.file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return { data: null, error: uploadError.message };
        }

        file_path = uploadData.path;
        file_size = input.file.size;
        mime_type = input.file.type;
      }

      // Insert resource record with proper user fields for RLS
      const insertData: any = {
        client_id: input.client_id,
        resource_type: input.resource_type,
        title: input.title,
        description: input.description,
        url: input.resource_type === 'url' ? input.url : null,
        file_path: input.resource_type === 'document' ? file_path : null,
        file_size: input.resource_type === 'document' ? file_size : null,
        mime_type: input.resource_type === 'document' ? mime_type : null,
        is_active: true,
        created_by: user.id, // Ensure this matches auth.uid()
        updated_by: user.id  // Ensure this matches auth.uid()
      };

      // Only include tenant_id if it's a valid UUID
      if (tenantId && isUUID(tenantId)) {
        insertData.tenant_id = tenantId;
      }

      const { data, error } = await supabase
        .from('tbl_client_resources' as any)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        // Clean up uploaded file if database insert fails
        if (file_path) {
          await supabase.storage.from('documents').remove([file_path]);
        }
        return { data: null, error: error.message };
      }

      return { data: data as unknown as ClientResource, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createResource:', error);
      return { data: null, error: error.message };
    }
  }

  static async getClientResources(clientId: string): Promise<{ data: ClientResource[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_client_resources' as any)
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error in getClientResources:', error);
        return { data: [], error: error.message };
      }

      return { data: (data || []) as unknown as ClientResource[], error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientResources:', error);
      return { data: [], error: error.message };
    }
  }

  static async downloadResource(filePath: string): Promise<{ data: Blob | null; error: string | null }> {
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
      console.error('Unexpected error in downloadResource:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteResource(resourceId: string): Promise<{ error: string | null }> {
    try {
      // Get resource to find file path
      const { data: resource, error: fetchError } = await supabase
        .from('tbl_client_resources' as any)
        .select('file_path')
        .eq('id', resourceId)
        .single();

      if (fetchError) {
        console.error('Error fetching resource for deletion:', fetchError);
        return { error: fetchError.message };
      }

      const resourceData = resource as unknown as { file_path: string };

      // Delete from storage if it's a document
      if (resourceData.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([resourceData.file_path]);

        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError.message);
        }
      }

      // Soft delete by setting is_active to false
      const { error: dbError } = await supabase
        .from('tbl_client_resources' as any)
        .update({ is_active: false })
        .eq('id', resourceId);

      if (dbError) {
        console.error('Database update error:', dbError);
        return { error: dbError.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteResource:', error);
      return { error: error.message };
    }
  }
}

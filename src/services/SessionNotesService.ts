
import { supabase } from '@/integrations/supabase/client';

export interface SessionNote {
  id: string;
  session_id: string;
  client_id: string;
  template_id?: string;
  content: string; // This will be decrypted content for display
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  created_by: string;
  updated_by: string;
}

export interface Session {
  id: string;
  client_id: string;
  therapist_id?: string;
  session_date: string;
  duration_minutes?: number;
  session_type: string;
  status: string;
  summary_excerpt?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  created_by?: string;
  updated_by?: string;
}

// Encryption key - in production this should come from secure configuration
const ENCRYPTION_KEY = 'session_notes_encryption_key_2024';

export class SessionNotesService {
  static async getSessionNotes(clientId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_notes')
        .select('*, decrypt_session_note_content(content, $1) as decrypted_content')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching session notes:', error);
        return { data: [], error: error.message };
      }

      // Transform the data to use decrypted content
      const transformedData = (data || []).map(note => ({
        ...note,
        content: note.decrypted_content || '[DECRYPTION_ERROR]'
      }));

      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching session notes:', error);
      return { data: [], error: error.message };
    }
  }

  static async createSessionNote(noteData: {
    session_id: string;
    client_id: string;
    template_id?: string;
    content: string;
    tenant_id?: string;
  }): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Encrypt the content before storing
      const { data: encryptedContent, error: encryptError } = await supabase
        .rpc('encrypt_session_note_content', {
          content_text: noteData.content,
          encryption_key: ENCRYPTION_KEY
        });

      if (encryptError) {
        console.error('Encryption error:', encryptError);
        return { data: null, error: 'Failed to encrypt content' };
      }

      const { data, error } = await supabase
        .from('tbl_session_notes')
        .insert({
          session_id: noteData.session_id,
          client_id: noteData.client_id,
          tenant_id: noteData.tenant_id || user.user_metadata?.tenant_id,
          template_id: noteData.template_id,
          content: encryptedContent,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating session note:', error);
        return { data: null, error: error.message };
      }

      // Return the note with decrypted content for immediate display
      return { 
        data: {
          ...data,
          content: noteData.content // Use original content since we just created it
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Unexpected error creating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateSessionNote(
    noteId: string, 
    updates: Partial<Pick<SessionNote, 'content' | 'template_id'>>
  ): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const updateData: any = {
        updated_by: user.id
      };

      // If content is being updated, encrypt it
      if (updates.content !== undefined) {
        const { data: encryptedContent, error: encryptError } = await supabase
          .rpc('encrypt_session_note_content', {
            content_text: updates.content,
            encryption_key: ENCRYPTION_KEY
          });

        if (encryptError) {
          console.error('Encryption error:', encryptError);
          return { data: null, error: 'Failed to encrypt content' };
        }

        updateData.content = encryptedContent;
      }

      if (updates.template_id !== undefined) {
        updateData.template_id = updates.template_id;
      }

      const { data, error } = await supabase
        .from('tbl_session_notes')
        .update(updateData)
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        console.error('Database error updating session note:', error);
        return { data: null, error: error.message };
      }

      // Return with decrypted content
      return { 
        data: {
          ...data,
          content: updates.content || data.content
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Unexpected error updating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessions(clientId: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Database error fetching sessions:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching sessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async createSession(sessionData: {
    client_id: string;
    session_date: string;
    duration_minutes?: number;
    session_type: string;
    status: string;
    summary_excerpt?: string;
  }): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_sessions')
        .insert({
          ...sessionData,
          tenant_id: user.user_metadata?.tenant_id,
          therapist_id: user.id,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating session:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error creating session:', error);
      return { data: null, error: error.message };
    }
  }
}

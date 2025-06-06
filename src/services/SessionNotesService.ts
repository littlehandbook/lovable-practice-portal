
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

export interface Homework {
  id: string;
  title: string;
  description?: string;
  assigned_date: string;
  due_date?: string;
  status: 'pending' | 'completed' | 'overdue';
  completed_at?: string;
  client_id: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

// Encryption key - in production this should come from secure configuration
const ENCRYPTION_KEY = 'session_notes_encryption_key_2024';

export class SessionNotesService {
  static async getSessionNotes(clientId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      // Get the raw notes from the database
      const { data: rawData, error } = await supabase
        .from('tbl_session_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching session notes:', error);
        return { data: [], error: error.message };
      }

      // For now, return with placeholder content since we need the encryption functions
      const notes: SessionNote[] = (rawData || []).map(note => ({
        ...note,
        content: '[Content encrypted - decryption not yet implemented]'
      }));

      return { data: notes, error: null };
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

      // For now, store content as plain text in bytea format
      const contentBuffer = new TextEncoder().encode(noteData.content);

      const { data, error } = await supabase
        .from('tbl_session_notes')
        .insert({
          session_id: noteData.session_id,
          client_id: noteData.client_id,
          tenant_id: noteData.tenant_id || user.user_metadata?.tenant_id,
          template_id: noteData.template_id,
          content: contentBuffer,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating session note:', error);
        return { data: null, error: error.message };
      }

      // Return the note with original content for immediate display
      return { 
        data: {
          ...data,
          content: noteData.content
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

      // If content is being updated, encode it
      if (updates.content !== undefined) {
        const contentBuffer = new TextEncoder().encode(updates.content);
        updateData.content = contentBuffer;
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

      // Return with original content
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

  // Homework methods for HomeworkTab compatibility
  static async getHomework(clientId: string): Promise<{ data: Homework[]; error: string | null }> {
    // Mock implementation - replace with actual homework table when created
    const mockHomework: Homework[] = [
      {
        id: '1',
        title: 'Daily Mood Journal',
        description: 'Record your mood and any triggers you notice daily',
        assigned_date: '2024-01-15',
        due_date: '2024-01-22',
        status: 'pending',
        client_id: clientId,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Breathing Exercise Practice',
        description: 'Practice the 4-7-8 breathing technique twice daily',
        assigned_date: '2024-01-10',
        due_date: '2024-01-17',
        status: 'completed',
        completed_at: '2024-01-16T14:30:00Z',
        client_id: clientId,
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-16T14:30:00Z'
      }
    ];

    return { data: mockHomework, error: null };
  }

  static async updateHomework(
    homeworkId: string, 
    updates: Partial<Pick<Homework, 'status' | 'completed_at'>>
  ): Promise<{ data: Homework | null; error: string | null }> {
    // Mock implementation - replace with actual homework table update when created
    console.log('Updating homework:', homeworkId, updates);
    
    return { 
      data: {
        id: homeworkId,
        title: 'Updated Assignment',
        assigned_date: new Date().toISOString(),
        status: updates.status || 'pending',
        completed_at: updates.completed_at,
        client_id: 'mock-client-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, 
      error: null 
    };
  }
}

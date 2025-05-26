
import { supabase } from '@/integrations/supabase/client';

export interface SessionNote {
  id: string;
  session_id: string;
  client_id: string;
  template_type: string;
  content: Record<string, string>;
  freud_risk_rating?: number;
  practitioner_risk_rating?: number;
  ai_assessment?: string;
  ai_evaluation?: string;
  ai_next_session?: string;
  ai_homework_suggestions?: string;
  is_shared_with_client: boolean;
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
  notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Homework {
  id: string;
  client_id: string;
  session_id?: string;
  note_id?: string;
  title: string;
  description?: string;
  assigned_date: string;
  due_date?: string;
  status: string;
  completion_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  assigned_by: string;
  updated_by?: string;
}

export class SessionNotesService {
  static async getSessionNotes(clientId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session notes:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching session notes:', error);
      return { data: [], error: error.message };
    }
  }

  static async createSessionNote(noteData: {
    session_id: string;
    client_id: string;
    template_type: string;
    content: Record<string, string>;
    tenant_id?: string;
  }): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_clients_notes')
        .insert({
          ...noteData,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session note:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error creating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateSessionNote(
    noteId: string, 
    updates: Partial<SessionNote>
  ): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_clients_notes')
        .update({
          ...updates,
          updated_by: user.id
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        console.error('Error updating session note:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessions(clientId: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching sessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async getHomework(clientId: string): Promise<{ data: Homework[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_clients_homework')
        .select('*')
        .eq('client_id', clientId)
        .order('assigned_date', { ascending: false });

      if (error) {
        console.error('Error fetching homework:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching homework:', error);
      return { data: [], error: error.message };
    }
  }

  static async updateHomework(
    homeworkId: string,
    updates: Partial<Homework>
  ): Promise<{ data: Homework | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_clients_homework')
        .update({
          ...updates,
          updated_by: user.id
        })
        .eq('id', homeworkId)
        .select()
        .single();

      if (error) {
        console.error('Error updating homework:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating homework:', error);
      return { data: null, error: error.message };
    }
  }
}

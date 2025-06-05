import { supabase } from '@/integrations/supabase/client';
import { Session, SessionNote, ServiceError } from '@/models';

export class SessionService {
  static async getSessions(clientId?: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      let query = supabase
        .from('tbl_sessions' as any)
        .select('*')
        .order('session_date', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error in getSessions:', error);
        return { data: [], error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const sessions = (data || []) as unknown as Session[];
      return { data: sessions, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async getSessionsByDateRange(startDate: string, endDate: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions' as any)
        .select('*')
        .gte('session_date', startDate)
        .lte('session_date', endDate)
        .order('session_date', { ascending: true });

      if (error) {
        console.error('Supabase error in getSessionsByDateRange:', error);
        return { data: [], error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const sessions = (data || []) as unknown as Session[];
      return { data: sessions, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionsByDateRange:', error);
      return { data: [], error: error.message };
    }
  }

  static async getSession(sessionId: string): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions' as any)
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Supabase error in getSession:', error);
        return { data: null, error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const session = data as unknown as Session;
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async createSession(sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_sessions' as any)
        .insert({
          ...sessionData,
          tenant_id: user.user_metadata?.tenant_id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createSession:', error);
        return { data: null, error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const session = data as unknown as Session;
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessionNotes(sessionId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_session_notes' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error in getSessionNotes:', error);
        return { data: [], error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const notes = (data || []) as unknown as SessionNote[];
      return { data: notes, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionNotes:', error);
      return { data: [], error: error.message };
    }
  }

  static async createSessionNote(noteData: Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_session_notes' as any)
        .insert({
          ...noteData,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error in createSessionNote:', error);
        return { data: null, error: error.message };
      }

      // TODO: remove this cast when Supabase types are regenerated
      const note = data as unknown as SessionNote;
      return { data: note, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createSessionNote:', error);
      return { data: null, error: error.message };
    }
  }
}

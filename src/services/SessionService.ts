
import { supabase } from '@/integrations/supabase/client';

export interface Session {
  id: string;
  tenant_id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  session_time: string;
  session_type: 'Video' | 'In-person' | 'Phone';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  duration_minutes: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithClient extends Session {
  client: {
    id: string;
    name: string;
    email?: string;
  };
}

export class SessionService {
  static async getSessions(therapistId?: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      let query = supabase
        .from('tbl_sessions' as any)
        .select('*')
        .order('session_date', { ascending: false });

      if (therapistId) {
        query = query.eq('therapist_id', therapistId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data || []) as unknown as Session[], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async getSessionsWithClients(therapistId?: string): Promise<{ data: SessionWithClient[]; error: string | null }> {
    try {
      let query = supabase
        .from('tbl_sessions' as any)
        .select(`
          *,
          client:tbl_clients(id, name, email)
        `)
        .order('session_date', { ascending: false });

      if (therapistId) {
        query = query.eq('therapist_id', therapistId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data || []) as unknown as SessionWithClient[], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async createSession(sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions' as any)
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as unknown as Session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async updateSession(sessionId: string, sessionData: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions' as any)
        .update(sessionData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as unknown as Session, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async deleteSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tbl_sessions' as any)
        .delete()
        .eq('id', sessionId);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

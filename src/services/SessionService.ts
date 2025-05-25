
import { supabase } from '@/integrations/supabase/client';

export interface Session {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  session_time: string;
  session_type: 'Video' | 'In-person' | 'Phone';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithClient extends Session {
  client: {
    name: string;
    email?: string;
  };
}

export class SessionService {
  static async getClientSessions(clientId: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async getAllSessions(): Promise<{ data: SessionWithClient[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions')
        .select(`
          *,
          client:tbl_clients(name, email)
        `)
        .order('session_date', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  }

  static async createSession(sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Session | null; error: string | null }> {
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
          therapist_id: user.id
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  static async updateSession(sessionId: string, sessionData: Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('tbl_sessions')
        .update(sessionData)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }
}

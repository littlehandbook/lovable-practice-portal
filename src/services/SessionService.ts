
import { Session, SessionNote, ServiceError } from '@/models';

const API_BASE_URL = '/api';

export class SessionService {
  static async getSessions(clientId?: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const url = clientId 
        ? `${API_BASE_URL}/sessions?client_id=${clientId}`
        : `${API_BASE_URL}/sessions`;

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch sessions: ${res.statusText}` };
      }

      const sessions = await res.json();
      return { data: sessions, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async getSessionsByDateRange(startDate: string, endDate: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch sessions: ${res.statusText}` };
      }

      const sessions = await res.json();
      return { data: sessions, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionsByDateRange:', error);
      return { data: [], error: error.message };
    }
  }

  static async getSession(sessionId: string): Promise<{ data: Session | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: null, error: `Failed to fetch session: ${res.statusText}` };
      }

      const session = await res.json();
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async createSession(sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Session | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create session: ${res.statusText}` };
      }

      const session = await res.json();
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createSession:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessionNotes(sessionId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/notes`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch session notes: ${res.statusText}` };
      }

      const notes = await res.json();
      return { data: notes, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getSessionNotes:', error);
      return { data: [], error: error.message };
    }
  }

  static async createSessionNote(noteData: Omit<SessionNote, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/session-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create session note: ${res.statusText}` };
      }

      const note = await res.json();
      return { data: note, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createSessionNote:', error);
      return { data: null, error: error.message };
    }
  }
}


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

const API_BASE_URL = '/api';

export class SessionNotesService {
  static async getSessionNotes(clientId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/session-notes?client_id=${clientId}`, {
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
      console.error('Unexpected error creating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateSessionNote(
    noteId: string, 
    updates: Partial<SessionNote>
  ): Promise<{ data: SessionNote | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/session-notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to update session note: ${res.statusText}` };
      }

      const note = await res.json();
      return { data: note, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessions(clientId: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions?client_id=${clientId}`, {
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
      console.error('Unexpected error fetching sessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async getHomework(clientId: string): Promise<{ data: Homework[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/homework?client_id=${clientId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch homework: ${res.statusText}` };
      }

      const homework = await res.json();
      return { data: homework, error: null };
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
      const res = await fetch(`${API_BASE_URL}/homework/${homeworkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to update homework: ${res.statusText}` };
      }

      const homework = await res.json();
      return { data: homework, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating homework:', error);
      return { data: null, error: error.message };
    }
  }
}


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

// Mock data until database tables are created
const mockSessionNotes: SessionNote[] = [
  {
    id: '1',
    session_id: 'session-1',
    client_id: 'mock-client-id',
    template_type: 'soap',
    content: {
      subjective: 'Client reported feeling anxious about work presentation.',
      objective: 'Client appeared fidgety, spoke rapidly.',
      assessment: 'Anxiety symptoms present, coping strategies needed.',
      plan: 'Continue CBT techniques, relaxation exercises.'
    },
    freud_risk_rating: 2,
    practitioner_risk_rating: 3,
    ai_assessment: 'Client shows signs of generalized anxiety with work-related triggers.',
    ai_evaluation: 'Progress noted in self-awareness. Recommend continued focus on coping strategies.',
    ai_next_session: 'Focus on workplace anxiety management and assertiveness training.',
    ai_homework_suggestions: 'Implement daily mindfulness practice and anxiety journal.',
    is_shared_with_client: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 'therapist-1',
    updated_by: 'therapist-1'
  }
];

const mockHomework: Homework[] = [
  {
    id: '1',
    client_id: 'mock-client-id',
    session_id: 'session-1',
    title: 'Daily Breathing Exercises',
    description: 'Practice deep breathing exercises for 10 minutes each morning and evening.',
    assigned_date: '2024-01-15',
    due_date: '2024-01-22',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    assigned_by: 'therapist-1'
  },
  {
    id: '2',
    client_id: 'mock-client-id',
    session_id: 'session-1',
    title: 'Anxiety Journal',
    description: 'Keep track of anxiety triggers and your responses in a daily journal.',
    assigned_date: '2024-01-10',
    due_date: '2024-01-17',
    status: 'completed',
    completed_at: '2024-01-16T14:00:00Z',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-16T14:00:00Z',
    assigned_by: 'therapist-1'
  }
];

export class SessionNotesService {
  static async getSessionNotes(clientId: string): Promise<{ data: SessionNote[]; error: string | null }> {
    try {
      // TODO: Replace with actual database query once tables are created
      // const { data, error } = await supabase
      //   .from('tbl_clients_notes')
      //   .select('*')
      //   .eq('client_id', clientId)
      //   .order('created_at', { ascending: false });

      console.log('Fetching session notes for client:', clientId);
      
      // Return mock data for now
      return { data: mockSessionNotes, error: null };
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

      // TODO: Replace with actual database query once tables are created
      console.log('Creating session note:', noteData);
      
      // Mock response
      const newNote: SessionNote = {
        id: Date.now().toString(),
        ...noteData,
        freud_risk_rating: 1,
        practitioner_risk_rating: 1,
        is_shared_with_client: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id,
        updated_by: user.id
      };

      return { data: newNote, error: null };
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

      // TODO: Replace with actual database query once tables are created
      console.log('Updating session note:', noteId, updates);
      
      // Mock response
      const updatedNote = mockSessionNotes.find(note => note.id === noteId);
      if (updatedNote) {
        Object.assign(updatedNote, updates, { updated_by: user.id, updated_at: new Date().toISOString() });
        return { data: updatedNote, error: null };
      }

      return { data: null, error: 'Note not found' };
    } catch (error: any) {
      console.error('Unexpected error updating session note:', error);
      return { data: null, error: error.message };
    }
  }

  static async getSessions(clientId: string): Promise<{ data: Session[]; error: string | null }> {
    try {
      // TODO: Replace with actual database query once tables are created
      console.log('Fetching sessions for client:', clientId);
      
      // Return empty sessions for now
      return { data: [], error: null };
    } catch (error: any) {
      console.error('Unexpected error fetching sessions:', error);
      return { data: [], error: error.message };
    }
  }

  static async getHomework(clientId: string): Promise<{ data: Homework[]; error: string | null }> {
    try {
      // TODO: Replace with actual database query once tables are created
      console.log('Fetching homework for client:', clientId);
      
      // Return mock data for now
      return { data: mockHomework, error: null };
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

      // TODO: Replace with actual database query once tables are created
      console.log('Updating homework:', homeworkId, updates);
      
      // Mock response
      const homework = mockHomework.find(hw => hw.id === homeworkId);
      if (homework) {
        Object.assign(homework, updates, { updated_by: user.id, updated_at: new Date().toISOString() });
        return { data: homework, error: null };
      }

      return { data: null, error: 'Homework not found' };
    } catch (error: any) {
      console.error('Unexpected error updating homework:', error);
      return { data: null, error: error.message };
    }
  }
}

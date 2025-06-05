
// Centralized model definitions
// TODO: These should eventually be replaced with auto-generated Supabase types

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  risk_score?: number;
  risk_assessment_date?: string;
  risk_notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  therapist_id: string;
  created_by?: string;
  updated_by?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  document_type: 'client_upload' | 'session_notes' | 'treatment_plan' | 'assessment';
  is_shared_with_client: boolean;
  created_at: string;
  client_id?: string;
  therapist_id?: string;
  tenant_id?: string;
  uploaded_by?: string;
}

export interface Session {
  id: string;
  client_id: string;
  therapist_id: string;
  session_date: string;
  duration_minutes: number;
  session_type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  content: string;
  note_type: 'progress' | 'treatment_plan' | 'assessment' | 'general';
  is_private: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

// Custom error class for service errors
export class ServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Add ClientResource export
export * from './ClientResource';

// Add ClientJournalEntry export
export type { ClientJournalEntry, CreateJournalEntryInput, UpdateJournalEntryInput } from '../services/ClientJournalService';

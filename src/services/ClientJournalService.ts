
export interface ClientJournalEntry {
  id: string;
  client_id: string;
  tenant_id: string;
  title: string;
  content: string;
  session_date?: string;
  is_shared_with_practitioner: boolean;
  shared_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateJournalEntryInput {
  title: string;
  content: string;
  session_date?: string;
  is_shared_with_practitioner?: boolean;
}

export interface UpdateJournalEntryInput extends Partial<CreateJournalEntryInput> {
  id: string;
}

const API_BASE_URL = '/api';

export class ClientJournalService {
  static async getClientJournalEntries(): Promise<{ data: ClientJournalEntry[]; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-journal`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { data: [], error: `Failed to fetch journal entries: ${res.statusText}` };
      }

      const entries = await res.json();
      return { data: entries, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientJournalEntries:', error);
      return { data: [], error: error.message };
    }
  }

  static async createJournalEntry(input: CreateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to create journal entry: ${res.statusText}` };
      }

      const entry = await res.json();
      return { data: entry, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createJournalEntry:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateJournalEntry(input: UpdateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-journal/${input.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!res.ok) {
        return { data: null, error: `Failed to update journal entry: ${res.statusText}` };
      }

      const entry = await res.json();
      return { data: entry, error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateJournalEntry:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteJournalEntry(entryId: string): Promise<{ error: string | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/client-journal/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return { error: `Failed to delete journal entry: ${res.statusText}` };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteJournalEntry:', error);
      return { error: error.message };
    }
  }
}

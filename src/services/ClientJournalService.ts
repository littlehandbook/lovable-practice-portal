
import { ApiClient } from '@/utils/apiClient';

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

export class ClientJournalService {
  static async getClientJournalEntries(): Promise<{ data: ClientJournalEntry[]; error: string | null }> {
    const response = await ApiClient.get<ClientJournalEntry[]>('/client-journal');
    return {
      data: response.data || [],
      error: response.error
    };
  }

  static async createJournalEntry(input: CreateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    return await ApiClient.post<ClientJournalEntry>('/client-journal', input);
  }

  static async updateJournalEntry(input: UpdateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    return await ApiClient.put<ClientJournalEntry>(`/client-journal/${input.id}`, input);
  }

  static async deleteJournalEntry(entryId: string): Promise<{ error: string | null }> {
    return await ApiClient.delete(`/client-journal/${entryId}`);
  }
}

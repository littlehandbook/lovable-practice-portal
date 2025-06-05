
import { supabase } from '@/integrations/supabase/client';

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tbl_client_journal' as any)
        .select('*')
        .order('session_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error in getClientJournalEntries:', error);
        return { data: [], error: error.message };
      }

      const entries = (data || []) as unknown as ClientJournalEntry[];
      return { data: entries, error: null };
    } catch (error: any) {
      console.error('Unexpected error in getClientJournalEntries:', error);
      return { data: [], error: error.message };
    }
  }

  static async createJournalEntry(input: CreateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // For now, use mock client and tenant IDs since auth doesn't have these claims yet
      const mockClientId = 'client-123';
      const mockTenantId = user.user_metadata?.tenant_id || 'tenant-123';

      const { data, error } = await supabase
        .from('tbl_client_journal' as any)
        .insert({
          client_id: mockClientId,
          tenant_id: mockTenantId,
          title: input.title,
          content: input.content,
          session_date: input.session_date,
          is_shared_with_practitioner: input.is_shared_with_practitioner || false,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        return { data: null, error: error.message };
      }

      const entry = data as unknown as ClientJournalEntry;
      return { data: entry, error: null };
    } catch (error: any) {
      console.error('Unexpected error in createJournalEntry:', error);
      return { data: null, error: error.message };
    }
  }

  static async updateJournalEntry(input: UpdateJournalEntryInput): Promise<{ data: ClientJournalEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const updateData: any = {
        updated_by: user.id
      };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.session_date !== undefined) updateData.session_date = input.session_date;
      if (input.is_shared_with_practitioner !== undefined) {
        updateData.is_shared_with_practitioner = input.is_shared_with_practitioner;
        if (input.is_shared_with_practitioner) {
          updateData.shared_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from('tbl_client_journal' as any)
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        return { data: null, error: error.message };
      }

      const entry = data as unknown as ClientJournalEntry;
      return { data: entry, error: null };
    } catch (error: any) {
      console.error('Unexpected error in updateJournalEntry:', error);
      return { data: null, error: error.message };
    }
  }

  static async deleteJournalEntry(entryId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('tbl_client_journal' as any)
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Database delete error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected error in deleteJournalEntry:', error);
      return { error: error.message };
    }
  }
}

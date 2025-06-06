import { supabase } from '@/integrations/supabase/client';

export interface ClientOverview {
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  risk_score: number;
  ai_risk_rating: string | null;
  ai_risk_reasoning: string | null;
  last_session_date: string | null;
  total_sessions: number;
  upcoming_sessions: number;
  referrals: any[];
}

export interface ClientGoalsWithGuidance {
  client_id: string;
  emotional_mental: string;
  physical: string;
  social_relational: string;
  spiritual: string;
  environmental: string;
  intellectual_occupational: string;
  financial: string;
  guidance: any[];
}

export interface SessionHistory {
  session_id: string;
  session_date: string;
  session_type: string;
  duration_minutes: number;
  status: string;
  summary_excerpt: string | null;
  notes_count: number;
}

export interface ClientDocument {
  document_id: string;
  name: string;
  file_path: string;
  document_type: string;
  created_at: string;
  is_shared: boolean;
  report_category?: string;
  file_size?: number;
  uploaded_by_name?: string;
  is_shared_with_client?: boolean;
  is_private?: boolean;
}

export class EnhancedClientRepository {
  async getClientOverview(clientId: string, tenantId: string): Promise<ClientOverview> {
    try {
      // First try to get basic client data
      const { data: clientData, error: clientError } = await supabase
        .from('tbl_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) {
        throw new Error(`Failed to fetch client: ${clientError.message}`);
      }

      // Get session statistics
      const { data: sessionStats, error: sessionError } = await supabase
        .from('tbl_sessions')
        .select('id, session_date, status')
        .eq('client_id', clientId);

      const totalSessions = sessionStats?.length || 0;
      const upcomingSessions = sessionStats?.filter(s => 
        new Date(s.session_date) > new Date() && s.status === 'scheduled'
      ).length || 0;

      const lastSessionDate = sessionStats?.length > 0 
        ? sessionStats.sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())[0]?.session_date
        : null;

      // Get referrals
      const { data: referrals } = await supabase
        .from('tbl_referrals')
        .select('*')
        .eq('client_id', clientId);

      return {
        client_id: clientData.id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        risk_score: clientData.risk_score || 0,
        ai_risk_rating: clientData.ai_risk_rating,
        ai_risk_reasoning: clientData.ai_risk_reasoning,
        last_session_date: lastSessionDate,
        total_sessions: totalSessions,
        upcoming_sessions: upcomingSessions,
        referrals: referrals || []
      };
    } catch (error) {
      console.error('Repository error in getClientOverview:', error);
      throw error;
    }
  }

  async getClientGoalsWithGuidance(clientId: string, tenantId: string): Promise<ClientGoalsWithGuidance> {
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('tbl_client_goals')
        .select('*')
        .eq('client_id', clientId)
        .eq('tenant_id', tenantId)
        .single();

      if (goalsError && goalsError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch goals: ${goalsError.message}`);
      }

      // Get guidance data if available
      const { data: guidanceData } = await supabase
        .from('tbl_goal_guidance')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      return {
        client_id: clientId,
        emotional_mental: goalsData?.emotional_mental || '',
        physical: goalsData?.physical || '',
        social_relational: goalsData?.social_relational || '',
        spiritual: goalsData?.spiritual || '',
        environmental: goalsData?.environmental || '',
        intellectual_occupational: goalsData?.intellectual_occupational || '',
        financial: goalsData?.financial || '',
        guidance: guidanceData || []
      };
    } catch (error) {
      console.error('Repository error in getClientGoalsWithGuidance:', error);
      throw error;
    }
  }

  async getClientSessionHistory(clientId: string, tenantId: string, limit = 50, offset = 0): Promise<SessionHistory[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('tbl_sessions')
        .select(`
          id,
          session_date,
          session_type,
          duration_minutes,
          status,
          summary_excerpt
        `)
        .eq('client_id', clientId)
        .order('session_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch session history: ${error.message}`);
      }

      // Get notes count for each session
      const sessionIds = sessions?.map(s => s.id) || [];
      const { data: notesCount } = await supabase
        .from('tbl_session_notes')
        .select('session_id')
        .in('session_id', sessionIds);

      const notesCounts = notesCount?.reduce((acc, note) => {
        acc[note.session_id] = (acc[note.session_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return (sessions || []).map(session => ({
        session_id: session.id,
        session_date: session.session_date,
        session_type: session.session_type,
        duration_minutes: session.duration_minutes || 0,
        status: session.status,
        summary_excerpt: session.summary_excerpt,
        notes_count: notesCounts[session.id] || 0
      }));
    } catch (error) {
      console.error('Repository error in getClientSessionHistory:', error);
      throw error;
    }
  }

  async getClientDocuments(clientId: string, tenantId: string): Promise<ClientDocument[]> {
    try {
      const { data: documents, error } = await supabase
        .from('tbl_documents')
        .select('*')
        .eq('client_id', clientId)
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return (documents || []).map(doc => ({
        document_id: doc.id,
        name: doc.name,
        file_path: doc.file_path,
        document_type: doc.document_type,
        created_at: doc.created_at,
        is_shared: doc.is_shared_with_client || false,
        report_category: doc.report_category,
        file_size: doc.file_size,
        uploaded_by_name: 'Unknown', // Placeholder since we don't have user names
        is_shared_with_client: doc.is_shared_with_client,
        is_private: doc.is_private
      }));
    } catch (error) {
      console.error('Repository error in getClientDocuments:', error);
      throw error;
    }
  }

  async updateClientRiskScore(clientId: string, tenantId: string, riskScore: number, riskNotes: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tbl_clients')
        .update({
          risk_score: riskScore,
          risk_notes: riskNotes,
          risk_assessment_date: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', clientId);

      if (error) {
        throw new Error(`Failed to update risk score: ${error.message}`);
      }
    } catch (error) {
      console.error('Repository error in updateClientRiskScore:', error);
      throw error;
    }
  }

  async generateSuperbill(clientId: string, tenantId: string, services: any, amount: number, description: string, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('tbl_invoices')
        .insert({
          client_id: clientId,
          tenant_id: tenantId,
          services_provided: services,
          amount: amount,
          description: description,
          status: 'pending',
          created_by: userId,
          updated_by: userId
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to generate superbill: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Repository error in generateSuperbill:', error);
      throw error;
    }
  }
}


import { supabase } from '@/integrations/supabase/client';

export interface ClientOverview {
  client_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  risk_score?: number;
  risk_assessment_date?: string;
  risk_notes?: string;
  referrals: any[];
}

export interface ClientGoalsWithGuidance {
  emotional_mental: string;
  physical: string;
  social_relational: string;
  spiritual: string;
  environmental: string;
  intellectual_occupational: string;
  financial: string;
  guidance: Record<string, string>;
}

export interface SessionHistory {
  session_id: string;
  session_date: string;
  session_type: string;
  duration_minutes: number;
  status: string;
  summary_excerpt?: string;
  therapist_name: string;
}

export interface ClientDocument {
  document_id: string;
  name: string;
  file_path: string;
  mime_type?: string;
  file_size?: number;
  document_type: string;
  report_category?: string;
  report_subcategory?: string;
  is_private: boolean;
  is_shared_with_client: boolean;
  uploaded_by_name: string;
  created_at: string;
}

export class EnhancedClientRepository {
  async getClientOverview(clientId: string, tenantId: string): Promise<ClientOverview | null> {
    try {
      const { data, error } = await supabase.rpc('sp_get_client_overview_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting client overview:', error);
      throw error;
    }
  }

  async updateClientRiskScore(
    clientId: string,
    tenantId: string,
    riskScore: number,
    riskNotes: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('sp_update_client_risk_score_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_risk_score: riskScore,
        p_risk_notes: riskNotes,
        p_user_id: userId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating client risk score:', error);
      throw error;
    }
  }

  async getClientGoalsWithGuidance(
    clientId: string,
    tenantId: string
  ): Promise<ClientGoalsWithGuidance | null> {
    try {
      const { data, error } = await supabase.rpc('sp_get_client_goals_with_guidance_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId
      });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting client goals with guidance:', error);
      throw error;
    }
  }

  async getClientSessionHistory(
    clientId: string,
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SessionHistory[]> {
    try {
      const { data, error } = await supabase.rpc('sp_get_client_session_history_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client session history:', error);
      throw error;
    }
  }

  async generateSuperbill(
    clientId: string,
    tenantId: string,
    services: any,
    amount: number,
    description: string,
    userId: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('sp_generate_superbill_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_services: services,
        p_amount: amount,
        p_description: description,
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating superbill:', error);
      throw error;
    }
  }

  async getClientDocuments(clientId: string, tenantId: string): Promise<ClientDocument[]> {
    try {
      const { data, error } = await supabase.rpc('sp_get_client_documents_v1', {
        p_client_id: clientId,
        p_tenant_id: tenantId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting client documents:', error);
      throw error;
    }
  }

  async auditFunctionCall(
    functionName: string,
    parameters: any,
    tenantId: string,
    userId: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('sp_audit_function_call_v1', {
        p_function_name: functionName,
        p_parameters: parameters,
        p_tenant_id: tenantId,
        p_user_id: userId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error auditing function call:', error);
      throw error;
    }
  }
}

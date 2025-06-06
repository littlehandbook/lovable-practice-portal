
import { EnhancedClientRepository } from '@/repository/EnhancedClientRepository';
import type { 
  ClientOverview, 
  ClientGoalsWithGuidance, 
  SessionHistory, 
  ClientDocument 
} from '@/repository/EnhancedClientRepository';

export class EnhancedClientService {
  private repository = new EnhancedClientRepository();

  async getClientOverview(clientId: string, tenantId: string): Promise<ClientOverview> {
    try {
      return await this.repository.getClientOverview(clientId, tenantId);
    } catch (error) {
      console.error('Error in getClientOverview:', error);
      // Return a default structure if the stored procedure fails
      return {
        client_id: clientId,
        name: 'Unknown Client',
        email: null,
        phone: null,
        risk_score: 0,
        ai_risk_rating: null,
        ai_risk_reasoning: null,
        last_session_date: null,
        total_sessions: 0,
        upcoming_sessions: 0,
        referrals: []
      };
    }
  }

  async getClientGoalsWithGuidance(clientId: string, tenantId: string): Promise<ClientGoalsWithGuidance> {
    try {
      return await this.repository.getClientGoalsWithGuidance(clientId, tenantId);
    } catch (error) {
      console.error('Error in getClientGoalsWithGuidance:', error);
      // Return empty goals structure
      return {
        client_id: clientId,
        emotional_mental: '',
        physical: '',
        social_relational: '',
        spiritual: '',
        environmental: '',
        intellectual_occupational: '',
        financial: '',
        guidance: []
      };
    }
  }

  async getClientSessionHistory(clientId: string, tenantId: string, limit = 50, offset = 0): Promise<SessionHistory[]> {
    try {
      return await this.repository.getClientSessionHistory(clientId, tenantId, limit, offset);
    } catch (error) {
      console.error('Error in getClientSessionHistory:', error);
      return [];
    }
  }

  async getClientDocuments(clientId: string, tenantId: string): Promise<ClientDocument[]> {
    try {
      return await this.repository.getClientDocuments(clientId, tenantId);
    } catch (error) {
      console.error('Error in getClientDocuments:', error);
      return [];
    }
  }

  async updateClientRiskScore(clientId: string, tenantId: string, riskScore: number, riskNotes: string, userId: string): Promise<void> {
    try {
      return await this.repository.updateClientRiskScore(clientId, tenantId, riskScore, riskNotes, userId);
    } catch (error) {
      console.error('Error in updateClientRiskScore:', error);
      throw new Error('Failed to update client risk score');
    }
  }

  async generateSuperbill(clientId: string, tenantId: string, services: any, amount: number, description: string, userId: string): Promise<string> {
    try {
      return await this.repository.generateSuperbill(clientId, tenantId, services, amount, description, userId);
    } catch (error) {
      console.error('Error in generateSuperbill:', error);
      throw new Error('Failed to generate superbill');
    }
  }
}

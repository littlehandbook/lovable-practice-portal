
import { EnhancedClientRepository, ClientOverview, ClientGoalsWithGuidance, SessionHistory, ClientDocument } from '@/repository/EnhancedClientRepository';

export class EnhancedClientService {
  constructor(private repo = new EnhancedClientRepository()) {}

  async getClientOverview(clientId: string, tenantId: string): Promise<ClientOverview | null> {
    await this.repo.auditFunctionCall('getClientOverview', { clientId, tenantId }, tenantId, 'system');
    return this.repo.getClientOverview(clientId, tenantId);
  }

  async updateClientRiskScore(
    clientId: string,
    tenantId: string,
    riskScore: number,
    riskNotes: string,
    userId: string
  ): Promise<void> {
    // Validate risk score
    if (riskScore < 0 || riskScore > 10) {
      throw new Error('Risk score must be between 0 and 10');
    }

    await this.repo.auditFunctionCall(
      'updateClientRiskScore',
      { clientId, tenantId, riskScore, riskNotes },
      tenantId,
      userId
    );

    return this.repo.updateClientRiskScore(clientId, tenantId, riskScore, riskNotes, userId);
  }

  async getClientGoalsWithGuidance(
    clientId: string,
    tenantId: string
  ): Promise<ClientGoalsWithGuidance | null> {
    await this.repo.auditFunctionCall(
      'getClientGoalsWithGuidance',
      { clientId, tenantId },
      tenantId,
      'system'
    );

    return this.repo.getClientGoalsWithGuidance(clientId, tenantId);
  }

  async getClientSessionHistory(
    clientId: string,
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SessionHistory[]> {
    // Validate pagination parameters
    if (limit < 1 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }

    if (offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    await this.repo.auditFunctionCall(
      'getClientSessionHistory',
      { clientId, tenantId, limit, offset },
      tenantId,
      'system'
    );

    return this.repo.getClientSessionHistory(clientId, tenantId, limit, offset);
  }

  async generateSuperbill(
    clientId: string,
    tenantId: string,
    services: any,
    amount: number,
    description: string,
    userId: string
  ): Promise<string> {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    await this.repo.auditFunctionCall(
      'generateSuperbill',
      { clientId, tenantId, services, amount, description },
      tenantId,
      userId
    );

    return this.repo.generateSuperbill(clientId, tenantId, services, amount, description, userId);
  }

  async getClientDocuments(clientId: string, tenantId: string): Promise<ClientDocument[]> {
    await this.repo.auditFunctionCall(
      'getClientDocuments',
      { clientId, tenantId },
      tenantId,
      'system'
    );

    return this.repo.getClientDocuments(clientId, tenantId);
  }
}

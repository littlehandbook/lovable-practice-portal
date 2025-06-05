
import { useState, useEffect } from 'react';
import { EnhancedClientService } from '@/services/EnhancedClientService';
import { ClientOverview, ClientGoalsWithGuidance, SessionHistory, ClientDocument } from '@/repository/EnhancedClientRepository';

export function useEnhancedClient(clientId: string, tenantId: string) {
  const [clientService] = useState(() => new EnhancedClientService());
  const [overview, setOverview] = useState<ClientOverview | null>(null);
  const [goals, setGoals] = useState<ClientGoalsWithGuidance | null>(null);
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClientOverview = async () => {
    try {
      const data = await clientService.getClientOverview(clientId, tenantId);
      setOverview(data);
    } catch (err) {
      setError(`Failed to load client overview: ${err}`);
    }
  };

  const loadClientGoals = async () => {
    try {
      const data = await clientService.getClientGoalsWithGuidance(clientId, tenantId);
      setGoals(data);
    } catch (err) {
      setError(`Failed to load client goals: ${err}`);
    }
  };

  const loadSessionHistory = async (limit = 50, offset = 0) => {
    try {
      const data = await clientService.getClientSessionHistory(clientId, tenantId, limit, offset);
      setSessions(data);
    } catch (err) {
      setError(`Failed to load session history: ${err}`);
    }
  };

  const loadClientDocuments = async () => {
    try {
      const data = await clientService.getClientDocuments(clientId, tenantId);
      setDocuments(data);
    } catch (err) {
      setError(`Failed to load client documents: ${err}`);
    }
  };

  const updateRiskScore = async (riskScore: number, riskNotes: string, userId: string) => {
    try {
      await clientService.updateClientRiskScore(clientId, tenantId, riskScore, riskNotes, userId);
      // Reload overview to get updated risk score
      await loadClientOverview();
    } catch (err) {
      setError(`Failed to update risk score: ${err}`);
      throw err;
    }
  };

  const generateSuperbill = async (services: any, amount: number, description: string, userId: string) => {
    try {
      const invoiceId = await clientService.generateSuperbill(clientId, tenantId, services, amount, description, userId);
      return invoiceId;
    } catch (err) {
      setError(`Failed to generate superbill: ${err}`);
      throw err;
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (!clientId || !tenantId) return;
      
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          loadClientOverview(),
          loadClientGoals(),
          loadSessionHistory(),
          loadClientDocuments()
        ]);
      } catch (err) {
        setError(`Failed to load client data: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [clientId, tenantId]);

  return {
    overview,
    goals,
    sessions,
    documents,
    loading,
    error,
    updateRiskScore,
    generateSuperbill,
    refetch: {
      overview: loadClientOverview,
      goals: loadClientGoals,
      sessions: loadSessionHistory,
      documents: loadClientDocuments
    }
  };
}

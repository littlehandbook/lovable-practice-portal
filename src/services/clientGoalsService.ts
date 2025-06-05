
// src/services/clientGoalsService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ClientGoals {
  emotional_mental: string;
  physical: string;
  social_relational: string;
  spiritual: string;
  environmental: string;
  intellectual_occupational: string;
  financial: string;
}

export async function fetchClientGoals(clientId: string, tenantId: string): Promise<ClientGoals | null> {
  const res = await fetch(`${API_BASE_URL}/client-goals/${clientId}?tenantId=${tenantId}`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error fetching goals: ${res.statusText}`);
  }
  
  return res.json();
}

export async function updateClientGoals(
  clientId: string,
  tenantId: string,
  goals: ClientGoals,
  userId: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/client-goals/${clientId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      goals,
      tenantId,
      userId
    }),
  });
  
  if (!res.ok) throw new Error(`Error saving goals: ${res.statusText}`);
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  // For now, return empty string - the microservice will need to handle auth
  return '';
}

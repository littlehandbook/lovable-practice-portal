
// src/services/configurationService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Configuration {
  key: string;
  value: any;
  type: string;
  version: number;
  updated_at: string;
  updated_by: string;
}

export async function fetchConfiguration(tenantId: string): Promise<Configuration[]> {
  const res = await fetch(`${API_BASE_URL}/configuration/${tenantId}`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Error fetching configuration: ${res.statusText}`);
  }
  
  return res.json();
}

export async function updateConfiguration(
  tenantId: string,
  key: string,
  value: any,
  userId: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/configuration/${tenantId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      key,
      value,
      userId
    }),
  });
  
  if (!res.ok) throw new Error(`Error updating configuration: ${res.statusText}`);
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  return '';
}

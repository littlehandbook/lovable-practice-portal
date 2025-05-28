
// src/services/tenantService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Tenant {
  tenant_id: string;
  practice_name: string;
  status: string;
  created_at: string;
}

export interface TenantPayload {
  practice_name: string;
  status?: 'active' | 'suspended';
}

// Create a new tenant
export async function createTenant(data: TenantPayload): Promise<Tenant> {
  const res = await fetch(`${API_BASE_URL}/tenants`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error(`Error creating tenant: ${res.statusText}`);
  return res.json();
}

// Update an existing tenant status
export async function updateTenantStatus(
  tenantId: string,
  newStatus: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tenants/${tenantId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus }),
  });
  
  if (!res.ok) throw new Error(`Error updating tenant status: ${res.statusText}`);
}

// List all tenants
export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch(`${API_BASE_URL}/tenants`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) throw new Error(`Error fetching tenants: ${res.statusText}`);
  return res.json();
}

// Validate tenant isolation
export async function validateTenantIsolation(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/tenants/validate-isolation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) throw new Error(`Error validating isolation: ${res.statusText}`);
  const result = await res.json();
  return result.isValid;
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  return '';
}


// src/services/userService.ts

const API_BASE_URL = '/api'; // Use Vite proxy to microservices

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  practice_name?: string;
  license_number?: string;
  is_active: boolean;
  tenant_id?: string;
}

export interface UserPayload {
  full_name?: string;
  phone?: string;
  practice_name?: string;
  license_number?: string;
  is_active?: boolean;
}

export async function upsertUser(userId: string, userData: UserPayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData),
  });
  
  if (!res.ok) throw new Error(`Error upserting user: ${res.statusText}`);
  return res.json();
}

export async function fetchUserByEmail(email: string): Promise<User | null> {
  const res = await fetch(`${API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error fetching user: ${res.statusText}`);
  }
  
  return res.json();
}

export async function fetchUser(userId: string): Promise<User | null> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error fetching user: ${res.statusText}`);
  }
  
  return res.json();
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  return '';
}

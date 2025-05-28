
// src/services/emailVerificationService.ts

const API_BASE_URL = '/api'; // Use Vite proxy to microservices

export interface EmailVerificationStatus {
  email: string;
  verified: boolean;
  verified_at?: string;
}

export async function verifyEmailAddress(email: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/email-verification/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, token }),
  });
  
  if (!res.ok) throw new Error(`Email verification failed: ${res.statusText}`);
}

export async function sendVerificationEmail(email: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/email-verification/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) throw new Error(`Failed to send verification email: ${res.statusText}`);
}

export async function getVerificationStatus(email: string): Promise<EmailVerificationStatus> {
  const res = await fetch(`${API_BASE_URL}/email-verification/status/${encodeURIComponent(email)}`, {
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) throw new Error(`Failed to get verification status: ${res.statusText}`);
  return res.json();
}

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // In a real implementation, this would get the token from your auth context
  return '';
}

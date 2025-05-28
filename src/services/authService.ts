
// src/services/authService.ts

const API_BASE_URL = '/api'; // Use Vite proxy to microservices

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  practiceName?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials),
  });
  
  if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
  return res.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) throw new Error(`Registration failed: ${res.statusText}`);
  return res.json();
}

export async function verifyEmail(email: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) throw new Error(`Email verification failed: ${res.statusText}`);
}


import { supabase } from "@/integrations/supabase/client";

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
  console.log('Attempting Supabase authentication for:', credentials.email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    console.error('Supabase auth error:', error);
    throw new Error(`Login failed: ${error.message}`);
  }

  if (!data.user || !data.session) {
    throw new Error('Login failed: No user or session returned');
  }

  console.log('Supabase authentication successful');

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  };
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  console.log('Attempting Supabase registration for:', data.email);
  
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        practice_name: data.practiceName,
        license_number: data.licenseNumber,
      },
    },
  });

  if (error) {
    console.error('Supabase registration error:', error);
    throw new Error(`Registration failed: ${error.message}`);
  }

  if (!authData.user || !authData.session) {
    throw new Error('Registration failed: No user or session returned');
  }

  console.log('Supabase registration successful');

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email!,
    },
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    },
  };
}

export async function verifyEmail(email: string): Promise<void> {
  console.log('Requesting email verification for:', email);
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    console.error('Email verification error:', error);
    throw new Error(`Email verification failed: ${error.message}`);
  }

  console.log('Email verification sent successfully');
}

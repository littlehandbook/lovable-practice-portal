
import { supabase } from '@/integrations/supabase/client';

export interface EmailVerificationStatus {
  email: string;
  verified: boolean;
  verified_at?: string;
}

export async function verifyEmailAddress(email: string, token: string): Promise<void> {
  console.log('Email verification via microservice not yet implemented');
  throw new Error('Email verification microservice not yet implemented');
}

export async function sendVerificationEmail(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      throw error;
    }
  } catch (error: any) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function getVerificationStatus(email: string): Promise<EmailVerificationStatus> {
  console.log('Email verification status check not yet implemented');
  return {
    email,
    verified: false
  };
}

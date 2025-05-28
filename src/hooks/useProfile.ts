
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  full_name: string;
  phone: string;
  practice_name: string;
  license_number: string;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(async (profileData: Partial<ProfileData>) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Updating profile for user:', user.id, 'with data:', profileData);

      const { error: updateError } = await supabase.auth.updateUser({
        data: profileData
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      return true;
    } catch (err: any) {
      console.error('Exception updating profile:', err);
      setError('Failed to update profile');
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const changePassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Changing password for user');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully'
      });
      return true;
    } catch (err: any) {
      console.error('Exception changing password:', err);
      setError('Failed to change password');
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    updateProfile,
    changePassword,
    loading,
    error
  };
}

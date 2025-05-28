
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BrandingData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  practice_name: string;
}

export function useBranding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [branding, setBranding] = useState<BrandingData>({
    logo_url: '',
    primary_color: '#0f766e',
    secondary_color: '#14b8a6',
    practice_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching branding for user:', user.id);
      
      // For now, use default branding until branding microservice is implemented
      setBranding({
        logo_url: '',
        primary_color: '#0f766e',
        secondary_color: '#14b8a6',
        practice_name: user.email || ''
      });

    } catch (err: any) {
      console.error('Exception fetching branding:', err);
      setError('Failed to load branding');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const uploadLogo = useCallback(async (file: File) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      console.log('Logo upload feature not yet implemented');
      toast({
        title: 'Info',
        description: 'Logo upload feature coming soon',
      });
      return null;
    } catch (err: any) {
      console.error('Exception uploading logo:', err);
      setError('Failed to upload logo');
      return null;
    }
  }, [user, toast]);

  const saveBranding = useCallback(async (brandingData: Partial<BrandingData>) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      console.log('Branding save feature not yet implemented');
      
      setBranding(prev => ({ ...prev, ...brandingData }));
      
      toast({
        title: 'Info',
        description: 'Branding save feature coming soon'
      });
      return true;
    } catch (err: any) {
      console.error('Exception saving branding:', err);
      setError('Failed to save branding');
      toast({
        title: 'Error',
        description: 'Failed to save branding',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, branding, toast]);

  useEffect(() => {
    if (user) {
      fetchBranding();
    }
  }, [user, fetchBranding]);

  return {
    branding,
    loading,
    saving,
    error,
    fetchBranding,
    uploadLogo,
    saveBranding
  };
}

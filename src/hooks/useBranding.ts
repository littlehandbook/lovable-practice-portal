
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BrandingData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  practice_name: string;
}

const API_BASE_URL = '/api';

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

  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching branding via microservice for tenant:', tenantId);

      const res = await fetch(`${API_BASE_URL}/branding/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch branding: ${res.statusText}`);
      }

      const data = await res.json();

      setBranding({
        logo_url: data.logo_url || '',
        primary_color: data.primary_color || '#0f766e',
        secondary_color: data.secondary_color || '#14b8a6',
        practice_name: data.practice_name || ''
      });

    } catch (err) {
      console.error('Exception fetching branding:', err);
      setError('Failed to load branding');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const uploadLogo = useCallback(async (file: File) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    try {
      console.log('Uploading logo for tenant:', tenantId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenant_id', tenantId);

      const res = await fetch(`${API_BASE_URL}/branding/upload-logo`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Logo upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      return data.logo_url;
    } catch (err) {
      console.error('Exception uploading logo:', err);
      setError('Failed to upload logo');
      return null;
    }
  }, [user, tenantId]);

  const saveBranding = useCallback(async (brandingData: Partial<BrandingData>) => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      console.log('Saving branding via microservice for tenant:', tenantId);

      const res = await fetch(`${API_BASE_URL}/branding/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logo_url: brandingData.logo_url || branding.logo_url,
          primary_color: brandingData.primary_color || branding.primary_color,
          secondary_color: brandingData.secondary_color || branding.secondary_color,
          practice_name: brandingData.practice_name || branding.practice_name
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to save branding: ${res.statusText}`);
      }

      setBranding(prev => ({ ...prev, ...brandingData }));
      
      toast({
        title: 'Success',
        description: 'Branding saved successfully'
      });
      return true;
    } catch (err) {
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
  }, [user, tenantId, branding, toast]);

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

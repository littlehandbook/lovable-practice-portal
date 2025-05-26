
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Convert user ID to UUID format for tenant_id (user ID is already a UUID)
  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching branding for tenant:', tenantId);

      const { data, error } = await supabase.rpc('sp_get_branding', {
        p_tenant_id: tenantId // Now properly UUID
      });

      if (error) {
        console.error('Error fetching branding:', error);
        setError('Failed to load branding');
        return;
      }

      if (data && data.length > 0) {
        const brandingData = data[0];
        setBranding({
          logo_url: brandingData.logo_url || '',
          primary_color: brandingData.primary_color || '#0f766e',
          secondary_color: brandingData.secondary_color || '#14b8a6',
          practice_name: brandingData.practice_name || ''
        });
      } else {
        // No branding data found, keep defaults
        setBranding({
          logo_url: '',
          primary_color: '#0f766e',
          secondary_color: '#14b8a6',
          practice_name: ''
        });
      }
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

      // Create the logos bucket if it doesn't exist
      const bucketName = 'logos';
      
      // Check if bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
        }
      }

      const fileName = `${tenantId}/logo-${Date.now()}.${file.name.split('.').pop()}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Logo upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
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
      console.log('Saving branding with params:', {
        p_tenant_id: tenantId,
        p_logo_url: brandingData.logo_url || branding.logo_url,
        p_primary_color: brandingData.primary_color || branding.primary_color,
        p_secondary_color: brandingData.secondary_color || branding.secondary_color,
        p_practice_name: brandingData.practice_name || branding.practice_name,
        p_user_id: user.id
      });

      const { error } = await supabase.rpc('sp_upsert_branding', {
        p_tenant_id: tenantId, // Now UUID
        p_logo_url: brandingData.logo_url || branding.logo_url,
        p_primary_color: brandingData.primary_color || branding.primary_color,
        p_secondary_color: brandingData.secondary_color || branding.secondary_color,
        p_practice_name: brandingData.practice_name || branding.practice_name,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error saving branding:', error);
        setError(`Failed to save branding: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to save branding: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
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

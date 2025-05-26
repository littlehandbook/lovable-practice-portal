
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

      // Fetch branding data directly from the table
      const { data: brandingData, error: brandingError } = await supabase
        .from('tbl_branding')
        .select('logo_url, primary_color, secondary_color')
        .eq('tenant_id', tenantId)
        .single();

      if (brandingError && brandingError.code !== 'PGRST116') {
        console.error('Error fetching branding:', brandingError);
        setError('Failed to load branding');
        return;
      }

      // Fetch practice name from configurations
      const { data: configData, error: configError } = await supabase
        .from('tbl_configurations')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'practice_name')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error fetching practice name:', configError);
      }

      const practiceName = configData?.value ? String(configData.value).replace(/"/g, '') : '';

      setBranding({
        logo_url: brandingData?.logo_url || '',
        primary_color: brandingData?.primary_color || '#0f766e',
        secondary_color: brandingData?.secondary_color || '#14b8a6',
        practice_name: practiceName
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
      console.log('Saving branding with microservice approach for tenant:', tenantId);

      // Upsert branding data using direct database operations
      const { error: brandingError } = await supabase
        .from('tbl_branding')
        .upsert({
          tenant_id: tenantId,
          logo_url: brandingData.logo_url || branding.logo_url,
          primary_color: brandingData.primary_color || branding.primary_color,
          secondary_color: brandingData.secondary_color || branding.secondary_color,
          created_by: user.id,
          updated_by: user.id
        }, {
          onConflict: 'tenant_id'
        });

      if (brandingError) {
        console.error('Error saving branding:', brandingError);
        setError(`Failed to save branding: ${brandingError.message}`);
        toast({
          title: 'Error',
          description: `Failed to save branding: ${brandingError.message}`,
          variant: 'destructive'
        });
        return false;
      }

      // Upsert practice name in configurations if provided
      if (brandingData.practice_name !== undefined) {
        const { error: configError } = await supabase
          .from('tbl_configurations')
          .upsert({
            tenant_id: tenantId,
            key: 'practice_name',
            value: JSON.stringify(brandingData.practice_name),
            type: 'dynamic',
            version: 1,
            updated_by: user.id
          }, {
            onConflict: 'tenant_id,key'
          });

        if (configError) {
          console.error('Error saving practice name:', configError);
          setError(`Failed to save practice name: ${configError.message}`);
          toast({
            title: 'Warning',
            description: `Branding saved but practice name update failed: ${configError.message}`,
            variant: 'destructive'
          });
        }
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

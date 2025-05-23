
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Save, Upload } from 'lucide-react';

interface BrandingData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  practice_name: string;
}

export function BrandingTab() {
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
  const [hasChanges, setHasChanges] = useState(false);

  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchBranding();
  }, [tenantId]);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('sp_get_branding', {
        p_tenant_id: tenantId
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const brandingData = data[0];
        setBranding({
          logo_url: brandingData.logo_url || '',
          primary_color: brandingData.primary_color || '#0f766e',
          secondary_color: brandingData.secondary_color || '#14b8a6',
          practice_name: brandingData.practice_name || ''
        });
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branding settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandingChange = (field: keyof BrandingData, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveBranding = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.rpc('sp_upsert_branding', {
        p_tenant_id: tenantId,
        p_logo_url: branding.logo_url,
        p_primary_color: branding.primary_color,
        p_secondary_color: branding.secondary_color,
        p_practice_name: branding.practice_name,
        p_user_id: user.id
      });

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Branding settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branding settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading branding settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Branding & Customization</CardTitle>
        <Button
          onClick={saveBranding}
          disabled={!hasChanges || saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          <div>
            <Label htmlFor="practice_name">Practice Name</Label>
            <Input
              id="practice_name"
              value={branding.practice_name}
              onChange={(e) => handleBrandingChange('practice_name', e.target.value)}
              placeholder="Enter your practice name"
              disabled={saving}
            />
            <p className="text-sm text-gray-500 mt-1">
              This will replace "TherapyPortal" in the navigation
            </p>
          </div>

          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logo_url"
                value={branding.logo_url}
                onChange={(e) => handleBrandingChange('logo_url', e.target.value)}
                placeholder="Enter logo URL or upload a file"
                disabled={saving}
              />
              <Button variant="outline" disabled={saving}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {branding.logo_url && (
              <div className="mt-2">
                <img 
                  src={branding.logo_url} 
                  alt="Logo preview" 
                  className="h-12 w-auto object-contain border rounded"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                  disabled={saving}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.primary_color}
                  onChange={(e) => handleBrandingChange('primary_color', e.target.value)}
                  placeholder="#0f766e"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={branding.secondary_color}
                  onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                  disabled={saving}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.secondary_color}
                  onChange={(e) => handleBrandingChange('secondary_color', e.target.value)}
                  placeholder="#14b8a6"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Preview</h3>
            <div 
              className="border rounded p-4 text-white"
              style={{ backgroundColor: branding.primary_color }}
            >
              <h4 className="font-bold">
                {branding.practice_name || 'Practice Portal'}
              </h4>
              <p className="text-sm opacity-90">Sample navigation bar</p>
            </div>
          </div>
        </div>
        
        {hasChanges && (
          <div className="border-t pt-4">
            <p className="text-sm text-orange-600">You have unsaved changes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

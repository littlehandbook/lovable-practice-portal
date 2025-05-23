
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBranding } from '@/hooks/useBranding';
import { Upload, Save, Palette } from 'lucide-react';

export function BrandingTab() {
  const { branding, loading, saving, error, uploadLogo, saveBranding } = useBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    practice_name: '',
    primary_color: '#0f766e',
    secondary_color: '#14b8a6',
    logo_url: ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update form when branding loads
  React.useEffect(() => {
    if (branding && !loading) {
      setFormData({
        practice_name: branding.practice_name || '',
        primary_color: branding.primary_color || '#0f766e',
        secondary_color: branding.secondary_color || '#14b8a6',
        logo_url: branding.logo_url || ''
      });
    }
  }, [branding, loading]);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    
    try {
      const logoUrl = await uploadLogo(file);
      if (logoUrl) {
        setFormData(prev => ({ ...prev, logo_url: logoUrl }));
        setHasChanges(true);
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const success = await saveBranding(formData);
    if (success) {
      setHasChanges(false);
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
        <CardTitle>Practice Branding</CardTitle>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          <div>
            <Label htmlFor="practice_name">Practice Name</Label>
            <Input
              id="practice_name"
              value={formData.practice_name || ''}
              onChange={(e) => handleFormChange('practice_name', e.target.value)}
              placeholder="Enter your practice name"
              disabled={saving}
            />
          </div>

          <div>
            <Label>Practice Logo</Label>
            <div className="mt-2 space-y-4">
              {formData.logo_url && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={formData.logo_url} 
                    alt="Practice logo" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                    disabled={saving}
                  >
                    Remove Logo
                  </Button>
                </div>
              )}
              
              <div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || saving}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => handleFormChange('primary_color', e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                  disabled={saving}
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => handleFormChange('primary_color', e.target.value)}
                  placeholder="#0f766e"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => handleFormChange('secondary_color', e.target.value)}
                  className="w-12 h-10 p-1 border rounded"
                  disabled={saving}
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => handleFormChange('secondary_color', e.target.value)}
                  placeholder="#14b8a6"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Color Preview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: formData.primary_color }}
              >
                <h4 className="font-medium">Primary Color</h4>
                <p className="text-sm opacity-90">This will be used for main buttons and headers</p>
              </div>
              <div 
                className="p-4 rounded-lg text-white"
                style={{ backgroundColor: formData.secondary_color }}
              >
                <h4 className="font-medium">Secondary Color</h4>
                <p className="text-sm opacity-90">This will be used for accents and highlights</p>
              </div>
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

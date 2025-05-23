
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Save, AlertCircle } from 'lucide-react';

interface ConfigurationItem {
  key: string;
  value: any;
  type: string;
  version: number;
  updated_at: string;
  updated_by: string;
}

export function ConfigurationTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, we'll use a mock tenant ID since the tenant system isn't fully implemented
  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  // Default configuration schema
  const defaultConfig = {
    login_timeout: 10,
    session_duration: 50,
    auto_save_notes: true,
    email_notifications: true,
    practice_name: '',
    timezone: 'America/New_York'
  };

  // Fetch current configuration
  useEffect(() => {
    if (!tenantId || !user) return;
    
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.rpc('sp_get_config', { 
          p_tenant: tenantId 
        });

        if (error) {
          setError(error.message);
          console.error('Error fetching config:', error);
        } else {
          const configMap: Record<string, any> = { ...defaultConfig };
          
          if (data && Array.isArray(data)) {
            data.forEach((row: ConfigurationItem) => {
              try {
                configMap[row.key] = typeof row.value === 'string' 
                  ? JSON.parse(row.value) 
                  : row.value;
              } catch (e) {
                configMap[row.key] = row.value;
              }
            });
          }
          
          setConfig(configMap);
        }
      } catch (err) {
        setError('Failed to load configuration');
        console.error('Configuration fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [tenantId, user]);

  // Update a single configuration key
  const updateConfig = async (key: string, value: any) => {
    if (!user) return;
    
    setError(null);
    setSaving(true);

    // Client-side validation for login_timeout
    if (key === 'login_timeout') {
      const timeout = parseInt(value, 10);
      if (isNaN(timeout) || timeout < 1 || timeout > 20) {
        setError('Login timeout must be between 1 and 20 minutes');
        setSaving(false);
        return;
      }
      value = timeout;
    }

    try {
      const { error } = await supabase.rpc('sp_update_config', {
        p_tenant: tenantId,
        p_key: key,
        p_value: JSON.stringify(value),
        p_user: user.id
      });

      if (error) {
        setError(error.message);
        toast({
          title: 'Error',
          description: `Failed to update ${key}: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        setConfig(prev => ({ ...prev, [key]: value }));
        toast({
          title: 'Success',
          description: `${key} updated successfully`
        });
      }
    } catch (err) {
      setError('Failed to update configuration');
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Please log in to manage configurations</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="grid gap-6">
          <div>
            <Label htmlFor="practice_name">Practice Name</Label>
            <Input
              id="practice_name"
              value={config.practice_name || ''}
              onChange={(e) => updateConfig('practice_name', e.target.value)}
              placeholder="Enter your practice name"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="login_timeout">Login Timeout (minutes)</Label>
            <Input
              id="login_timeout"
              type="number"
              min={1}
              max={20}
              value={config.login_timeout || 10}
              onChange={(e) => updateConfig('login_timeout', e.target.value)}
              disabled={saving}
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be between 1 and 20 minutes
            </p>
          </div>

          <div>
            <Label htmlFor="session_duration">Default Session Duration (minutes)</Label>
            <Input
              id="session_duration"
              type="number"
              min={15}
              max={120}
              value={config.session_duration || 50}
              onChange={(e) => updateConfig('session_duration', parseInt(e.target.value))}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={config.timezone || 'America/New_York'}
              onChange={(e) => updateConfig('timezone', e.target.value)}
              placeholder="e.g., America/New_York"
              disabled={saving}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_save_notes">Auto-save notes</Label>
                <p className="text-sm text-gray-500">
                  Automatically save session notes while typing
                </p>
              </div>
              <Switch
                id="auto_save_notes"
                checked={config.auto_save_notes || false}
                onCheckedChange={(checked) => updateConfig('auto_save_notes', checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive email notifications for appointments and updates
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={config.email_notifications || false}
                onCheckedChange={(checked) => updateConfig('email_notifications', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {saving && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Save className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

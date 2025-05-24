import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle, Clock } from 'lucide-react';

interface ConfigurationItem {
  key: string;
  value: any;
  type: string;
  version: number;
  updated_at: string;
  updated_by: string;
}

// Common timezones with their display names
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', utcOffset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', utcOffset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', utcOffset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', utcOffset: -8 },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', utcOffset: -7 },
  { value: 'America/Anchorage', label: 'Alaska Time (AKST)', utcOffset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', utcOffset: -10 },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', utcOffset: 0 },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', utcOffset: 1 },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', utcOffset: 9 },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', utcOffset: 10 },
];

export function ConfigurationTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<Record<string, any>>({});
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});

  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  // Default configuration schema - removed practice_name
  const defaultConfig = {
    login_timeout: 10,
    session_duration: 50,
    auto_save_notes: true,
    email_notifications: true,
    timezone: 'America/New_York'
  };

  // Update current times for all timezones
  const updateCurrentTimes = () => {
    const times: Record<string, string> = {};
    const now = new Date();
    
    TIMEZONES.forEach(tz => {
      try {
        const time = now.toLocaleTimeString('en-US', {
          timeZone: tz.value,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        times[tz.value] = time;
      } catch (e) {
        times[tz.value] = 'Invalid';
      }
    });
    
    setCurrentTimes(times);
  };

  // Update times every minute
  useEffect(() => {
    updateCurrentTimes();
    const interval = setInterval(updateCurrentTimes, 60000);
    return () => clearInterval(interval);
  }, []);

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
          console.error('Error fetching config:', error);
          // Don't show error for empty configuration - this is normal for new tenants
          if (error.message?.includes('no rows') || error.code === 'PGRST116') {
            // No configuration found - use defaults
            setConfig({ ...defaultConfig });
          } else {
            setError('Failed to load configuration');
          }
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
          setPendingChanges({});
        }
      } catch (err) {
        console.error('Configuration fetch error:', err);
        // Use default configuration if fetch fails
        setConfig({ ...defaultConfig });
        setError(null); // Don't show error for missing config
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [tenantId, user]);

  // Update pending changes for a configuration key
  const updatePendingConfig = (key: string, value: any) => {
    setError(null);
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  // Save all pending changes
  const saveAllChanges = async () => {
    if (!user || Object.keys(pendingChanges).length === 0) return;
    
    setError(null);
    setSaving(true);

    try {
      // Validate login_timeout if it's being changed
      if ('login_timeout' in pendingChanges) {
        const timeout = parseInt(pendingChanges.login_timeout, 10);
        if (isNaN(timeout) || timeout < 1 || timeout > 20) {
          setError('Login timeout must be between 1 and 20 minutes');
          setSaving(false);
          return;
        }
        pendingChanges.login_timeout = timeout;
      }

      // Save each pending change
      for (const [key, value] of Object.entries(pendingChanges)) {
        const { error } = await supabase.rpc('sp_update_config', {
          p_tenant: tenantId,
          p_key: key,
          p_value: JSON.stringify(value),
          p_user: user.id
        });

        if (error) {
          setError(`Failed to update ${key}: ${error.message}`);
          setSaving(false);
          return;
        }
      }

      // Update local config state and clear pending changes
      setConfig(prev => ({ ...prev, ...pendingChanges }));
      setPendingChanges({});
      
      toast({
        title: 'Success',
        description: 'Configuration saved successfully'
      });
    } catch (err) {
      setError('Failed to save configuration');
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Get current value (pending change or saved config)
  const getCurrentValue = (key: string) => {
    return key in pendingChanges ? pendingChanges[key] : config[key];
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

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
            <Label htmlFor="login_timeout">Login Timeout (minutes)</Label>
            <Input
              id="login_timeout"
              type="number"
              min={1}
              max={20}
              value={getCurrentValue('login_timeout') || 10}
              onChange={(e) => updatePendingConfig('login_timeout', e.target.value)}
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
              value={getCurrentValue('session_duration') || 50}
              onChange={(e) => updatePendingConfig('session_duration', parseInt(e.target.value))}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={getCurrentValue('timezone') || 'America/New_York'}
              onValueChange={(value) => updatePendingConfig('timezone', value)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{tz.label}</span>
                      <div className="flex items-center text-sm text-gray-500 ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {currentTimes[tz.value] || 'Loading...'}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                checked={getCurrentValue('auto_save_notes') || false}
                onCheckedChange={(checked) => updatePendingConfig('auto_save_notes', checked)}
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
                checked={getCurrentValue('email_notifications') || false}
                onCheckedChange={(checked) => updatePendingConfig('email_notifications', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {saving && (
              <>
                <Save className="h-4 w-4 animate-spin" />
                <span className="text-sm text-blue-600">Saving...</span>
              </>
            )}
            {hasUnsavedChanges && !saving && (
              <span className="text-sm text-orange-600">You have unsaved changes</span>
            )}
          </div>
          
          <Button
            onClick={saveAllChanges}
            disabled={!hasUnsavedChanges || saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

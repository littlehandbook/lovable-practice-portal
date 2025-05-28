
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Info, Target } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchClientGoals, updateClientGoals, ClientGoals } from '@/services/clientGoalsService';

interface ClientGoalsTabProps {
  clientId: string;
}

const goalDescriptions = {
  emotional_mental: "Set goals around understanding and managing feelings, building resilience, enhancing self-awareness, and fostering positive thought patterns. This area supports overall psychological well-being and coping skills.",
  physical: "Focus on health, fitness, nutrition, sleep patterns, and physical activities that support overall wellness and vitality.",
  social_relational: "Build meaningful relationships, improve communication skills, develop social connections, and strengthen family or romantic relationships.",
  spiritual: "Explore personal values, meaning, purpose, faith practices, meditation, or connection to something greater than oneself.",
  environmental: "Create supportive living and working spaces, organize surroundings, and develop sustainable lifestyle practices.",
  intellectual_occupational: "Pursue learning opportunities, career development, skill building, creativity, and intellectual growth or professional advancement.",
  financial: "Develop healthy money management habits, budgeting skills, financial planning, and work toward financial stability and goals."
};

// Helper function to validate UUID format
const validateUuid = (u: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(u);
};

// Helper function to generate a UUID from a simple ID (for demo purposes)
const generateUUIDFromId = (id: string): string => {
  const paddedId = id.padStart(8, '0');
  return `${paddedId}-0000-4000-8000-000000000000`;
};

export function ClientGoalsTab({ clientId }: ClientGoalsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize with empty strings to prevent undefined values
  const [goals, setGoals] = useState<ClientGoals>({
    emotional_mental: '',
    physical: '',
    social_relational: '',
    spiritual: '',
    environmental: '',
    intellectual_occupational: '',
    financial: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate and ensure we have proper UUIDs
  if (!user?.id || !validateUuid(user.id)) {
    console.error('Invalid user ID:', user?.id);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Authentication error: Invalid user ID. Please sign out and sign back in.</p>
        </CardContent>
      </Card>
    );
  }

  const tenantId = user.id; // Using user.id as tenant_id
  
  // Convert clientId to UUID format if needed
  const clientUUID = validateUuid(clientId) ? clientId : generateUUIDFromId(clientId);

  useEffect(() => {
    fetchGoalsData();
  }, [clientId, tenantId]);

  const fetchGoalsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching goals via microservice for client:', clientUUID);
      
      const data = await fetchClientGoals(clientUUID, tenantId);

      if (data) {
        console.log('Setting goals from microservice data:', data);
        setGoals(data);
      } else {
        console.log('No goals data found, keeping default empty state');
      }
    } catch (err) {
      console.error('Exception fetching goals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Only show error for actual failures, not empty data
      if (!errorMessage.includes('No goals') && !errorMessage.includes('empty')) {
        setError('Failed to load client goals');
        toast({
          title: 'Error',
          description: 'Failed to load client goals',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (field: keyof ClientGoals, value: string) => {
    setGoals(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setError(null);
  };

  const saveGoals = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving goals via microservice:', goals);

      await updateClientGoals(clientUUID, tenantId, goals, user.id);

      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Client goals saved successfully'
      });
    } catch (err) {
      console.error('Exception saving goals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save goals';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderGoalField = (key: keyof ClientGoals, label: string) => (
    <div key={key} className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={key}>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <p className="text-sm text-gray-700">{goalDescriptions[key]}</p>
          </PopoverContent>
        </Popover>
      </div>
      <Textarea
        id={key}
        value={goals[key]}
        onChange={(e) => handleGoalChange(key, e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} goals...`}
        disabled={saving}
        className="min-h-[100px]"
      />
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Client Goals
        </CardTitle>
        <Button
          onClick={saveGoals}
          disabled={!hasChanges || saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Goals'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="grid gap-6">
          {renderGoalField('emotional_mental', 'Emotional/Mental')}
          {renderGoalField('physical', 'Physical')}
          {renderGoalField('social_relational', 'Social/Relational')}
          {renderGoalField('spiritual', 'Spiritual')}
          {renderGoalField('environmental', 'Environmental')}
          {renderGoalField('intellectual_occupational', 'Intellectual/Occupational')}
          {renderGoalField('financial', 'Financial')}
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

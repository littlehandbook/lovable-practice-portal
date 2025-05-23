import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ClientGoalsTabProps {
  clientId: string;
}

interface GoalData {
  emotional_mental: string;
  physical: string;
  social_relational: string;
  spiritual: string;
  environmental: string;
  intellectual_occupational: string;
  financial: string;
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

export function ClientGoalsTab({ clientId }: ClientGoalsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize with empty strings to prevent undefined values
  const [goals, setGoals] = useState<GoalData>({
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

  const tenantId = user?.id || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchGoals();
  }, [clientId, tenantId]);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching goals for client:', clientId, 'tenant:', tenantId);
      
      const { data, error } = await supabase.rpc('sp_get_client_goals', {
        p_client_id: clientId,
        p_tenant_id: tenantId
      });

      console.log('Goals fetch result:', { data, error });

      if (error) {
        console.error('Error fetching goals:', error);
        setError('Failed to load client goals');
        toast({
          title: 'Error',
          description: `Failed to load client goals: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      // Handle empty array gracefully - keep default empty strings
      if (data && data.length > 0) {
        const goalData = data[0];
        console.log('Setting goals from data:', goalData);
        setGoals(prev => ({
          emotional_mental: goalData.emotional_mental || '',
          physical: goalData.physical || '',
          social_relational: goalData.social_relational || '',
          spiritual: goalData.spiritual || '',
          environmental: goalData.environmental || '',
          intellectual_occupational: goalData.intellectual_occupational || '',
          financial: goalData.financial || ''
        }));
      } else {
        console.log('No goals data found, keeping default empty state');
        // Keep the default empty state - no need to update
      }
    } catch (err) {
      console.error('Exception fetching goals:', err);
      setError('Failed to load client goals');
      toast({
        title: 'Error',
        description: 'Failed to load client goals',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (field: keyof GoalData, value: string) => {
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
      console.log('Saving goals with params:', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_user_id: user.id,
        goals
      });

      const { error } = await supabase.rpc('sp_upsert_client_goals', {
        p_client_id: clientId,
        p_tenant_id: tenantId,
        p_emotional_mental: goals.emotional_mental,
        p_physical: goals.physical,
        p_social_relational: goals.social_relational,
        p_spiritual: goals.spiritual,
        p_environmental: goals.environmental,
        p_intellectual_occupational: goals.intellectual_occupational,
        p_financial: goals.financial,
        p_user_id: user.id
      });

      console.log('Goals save result:', { error });

      if (error) {
        console.error('Error saving goals:', error);
        setError(`Failed to save goals: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to save client goals: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Client goals saved successfully'
      });
    } catch (err) {
      console.error('Exception saving goals:', err);
      setError('Failed to save goals');
      toast({
        title: 'Error',
        description: 'Failed to save client goals',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderGoalField = (key: keyof GoalData, label: string) => (
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
        value={goals[key]} // Always guaranteed to be a string now
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
          <p className="text-gray-500">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Client Goals</CardTitle>
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

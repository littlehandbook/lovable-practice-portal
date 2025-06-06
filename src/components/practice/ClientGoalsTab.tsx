
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface ClientGoalsTabProps {
  clientId: string;
}

interface ClientGoals {
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

  useEffect(() => {
    fetchGoalsData();
  }, [clientId]);

  const fetchGoalsData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tbl_client_goals')
        .select('*')
        .eq('client_id', clientId)
        .eq('tenant_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setGoals({
          emotional_mental: data.emotional_mental || '',
          physical: data.physical || '',
          social_relational: data.social_relational || '',
          spiritual: data.spiritual || '',
          environmental: data.environmental || '',
          intellectual_occupational: data.intellectual_occupational || '',
          financial: data.financial || ''
        });
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load client goals');
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
      const { error } = await supabase
        .from('tbl_client_goals')
        .upsert({
          client_id: clientId,
          tenant_id: user.id,
          ...goals,
          created_by: user.id,
          updated_by: user.id
        });

      if (error) {
        throw error;
      }

      setHasChanges(false);
      toast({
        title: 'Success',
        description: 'Client goals saved successfully'
      });
    } catch (err) {
      console.error('Error saving goals:', err);
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

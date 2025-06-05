
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, Info, Save } from 'lucide-react';
import { ClientGoalsWithGuidance } from '@/repository/EnhancedClientRepository';
import { useToast } from '@/hooks/use-toast';
import { fetchClientGoals, updateClientGoals, ClientGoals } from '@/services/clientGoalsService';
import { useAuth } from '@/contexts/AuthContext';

interface ClientGoalsTabProps {
  clientId: string;
  tenantId: string;
  goals: ClientGoalsWithGuidance | null;
}

export const ClientGoalsTab: React.FC<ClientGoalsTabProps> = ({ 
  clientId, 
  tenantId,
  goals: initialGoals 
}) => {
  const [goals, setGoals] = useState<ClientGoals>({
    emotional_mental: '',
    physical: '',
    social_relational: '',
    spiritual: '',
    environmental: '',
    intellectual_occupational: '',
    financial: ''
  });
  const [guidance, setGuidance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadGoals = async () => {
      try {
        if (initialGoals) {
          setGoals({
            emotional_mental: initialGoals.emotional_mental || '',
            physical: initialGoals.physical || '',
            social_relational: initialGoals.social_relational || '',
            spiritual: initialGoals.spiritual || '',
            environmental: initialGoals.environmental || '',
            intellectual_occupational: initialGoals.intellectual_occupational || '',
            financial: initialGoals.financial || ''
          });
          setGuidance(initialGoals.guidance || {});
        } else {
          const fetchedGoals = await fetchClientGoals(clientId, tenantId);
          if (fetchedGoals) {
            setGoals(fetchedGoals);
          }
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load client goals',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [clientId, tenantId, initialGoals, toast]);

  const handleSaveGoals = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateClientGoals(clientId, tenantId, goals, user.id);
      toast({
        title: 'Success',
        description: 'Client goals saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save client goals',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGoalChange = (category: keyof ClientGoals, value: string) => {
    setGoals(prev => ({ ...prev, [category]: value }));
  };

  const goalCategories = [
    {
      key: 'emotional_mental' as keyof ClientGoals,
      label: 'Emotional/Mental',
      placeholder: 'Describe emotional and mental health goals...'
    },
    {
      key: 'physical' as keyof ClientGoals,
      label: 'Physical',
      placeholder: 'Describe physical health and wellness goals...'
    },
    {
      key: 'social_relational' as keyof ClientGoals,
      label: 'Social/Relational',
      placeholder: 'Describe relationship and social connection goals...'
    },
    {
      key: 'spiritual' as keyof ClientGoals,
      label: 'Spiritual',
      placeholder: 'Describe spiritual growth and meaning-making goals...'
    },
    {
      key: 'environmental' as keyof ClientGoals,
      label: 'Environmental',
      placeholder: 'Describe living environment and community goals...'
    },
    {
      key: 'intellectual_occupational' as keyof ClientGoals,
      label: 'Intellectual/Occupational (Vocational)',
      placeholder: 'Describe career, education, and intellectual growth goals...'
    },
    {
      key: 'financial' as keyof ClientGoals,
      label: 'Financial',
      placeholder: 'Describe financial stability and security goals...'
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Client Goals
            </CardTitle>
            <Button onClick={handleSaveGoals} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Goals'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goalCategories.map((category) => (
              <div key={category.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={category.key} className="text-sm font-medium">
                    {category.label}
                  </Label>
                  {guidance[category.key] && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button">
                          <Info className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="text-sm">{guidance[category.key]}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Textarea
                  id={category.key}
                  value={goals[category.key]}
                  onChange={(e) => handleGoalChange(category.key, e.target.value)}
                  placeholder={category.placeholder}
                  rows={3}
                  className="resize-none"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

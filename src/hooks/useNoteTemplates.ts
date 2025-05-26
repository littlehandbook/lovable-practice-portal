
import { useState, useEffect } from 'react';

// Define the structure of a template
interface Template {
  id: string;
  label: string;
  value: string;
  fields: { key: string; label: string; description?: string }[];
  isEnabled: boolean;
  isCustom: boolean;
}

// Default templates that match the ones in NoteTemplateSettings
const defaultTemplates: Template[] = [
  {
    id: 'free',
    label: 'Free Field',
    value: 'free',
    fields: [{ key: 'content', label: 'Session Notes' }],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'soap',
    label: 'SOAP Notes',
    value: 'soap',
    fields: [
      { key: 'subjective', label: 'Subjective', description: 'Client\'s perspective, feelings, and reported experiences' },
      { key: 'objective', label: 'Objective', description: 'Observable behaviors, appearance, and factual data' },
      { key: 'assessment', label: 'Assessment', description: 'Clinical interpretation and progress analysis' },
      { key: 'plan', label: 'Plan', description: 'Future treatment course and next steps' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'birp',
    label: 'BIRP Notes',
    value: 'birp',
    fields: [
      { key: 'behavior', label: 'Behavior', description: 'Observable and reported behaviors' },
      { key: 'intervention', label: 'Intervention', description: 'Therapeutic interventions used' },
      { key: 'response', label: 'Response', description: 'Client\'s response to interventions' },
      { key: 'plan', label: 'Plan', description: 'Future session plans and strategies' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'dap',
    label: 'DAP Notes',
    value: 'dap',
    fields: [
      { key: 'data', label: 'Data', description: 'Combined subjective and objective information' },
      { key: 'assessment', label: 'Assessment', description: 'Clinical assessment of the data' },
      { key: 'plan', label: 'Plan', description: 'Future treatment plan' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'pirp',
    label: 'PIRP Notes',
    value: 'pirp',
    fields: [
      { key: 'problem', label: 'Problem', description: 'Specific problems addressed in session' },
      { key: 'intervention', label: 'Intervention', description: 'Interventions used for problems' },
      { key: 'response', label: 'Response', description: 'Client\'s response to interventions' },
      { key: 'plan', label: 'Plan', description: 'Future plan for addressing problems' },
    ],
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'girp',
    label: 'GIRP Notes',
    value: 'girp',
    fields: [
      { key: 'goal', label: 'Goal', description: 'Client\'s treatment goals addressed' },
      { key: 'intervention', label: 'Intervention', description: 'Interventions aimed at goals' },
      { key: 'response', label: 'Response', description: 'Client\'s response in relation to goals' },
      { key: 'plan', label: 'Plan', description: 'Continued work on goals' },
    ],
    isEnabled: true,
    isCustom: false,
  },
];

export const useNoteTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);

  // In a real implementation, this would fetch from settings/database
  useEffect(() => {
    // TODO: Replace with actual API call to fetch templates from settings
    // For now, we'll use localStorage to simulate persistent settings
    const savedTemplates = localStorage.getItem('noteTemplates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
      } catch (error) {
        console.error('Error parsing saved templates:', error);
        setTemplates(defaultTemplates);
      }
    }
  }, []);

  const enabledTemplates = templates.filter(template => template.isEnabled);

  const updateTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('noteTemplates', JSON.stringify(newTemplates));
  };

  return {
    templates,
    enabledTemplates,
    updateTemplates
  };
};

import { useState, useEffect, useCallback } from 'react';

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

const STORAGE_KEY = 'noteTemplates';
const STORAGE_LISTENERS_KEY = 'templateStorageListeners';

// Create a simple event system for cross-component communication
const createStorageEventSystem = () => {
  const listeners = new Set<() => void>();
  
  return {
    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    notify: () => {
      listeners.forEach(callback => callback());
    }
  };
};

// Global event system for template changes
const templateStorageEvents = createStorageEventSystem();

export const useNoteTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from localStorage
  const loadTemplates = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const savedTemplates = localStorage.getItem(STORAGE_KEY);
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        // Validate the parsed data structure
        if (Array.isArray(parsed) && parsed.every(t => t.id && t.label && t.fields)) {
          setTemplates(parsed);
        } else {
          throw new Error('Invalid template data structure');
        }
      } else {
        // Initialize with default templates
        setTemplates(defaultTemplates);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates');
      setTemplates(defaultTemplates);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save templates to localStorage and notify other components
  const updateTemplates = useCallback((newTemplates: Template[]) => {
    try {
      setTemplates(newTemplates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
      // Notify other components that templates have changed
      templateStorageEvents.notify();
      setError(null);
    } catch (error) {
      console.error('Error saving templates:', error);
      setError('Failed to save templates');
    }
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Listen for changes from other components (like settings)
  useEffect(() => {
    const unsubscribe = templateStorageEvents.subscribe(() => {
      loadTemplates();
    });
    return unsubscribe;
  }, [loadTemplates]);

  // Get only enabled templates
  const enabledTemplates = templates.filter(template => template.isEnabled);

  // Get template by ID
  const getTemplateById = useCallback((id: string) => {
    return templates.find(template => template.id === id);
  }, [templates]);

  // Get enabled template by value
  const getEnabledTemplateByValue = useCallback((value: string) => {
    return enabledTemplates.find(template => template.value === value);
  }, [enabledTemplates]);

  return {
    templates,
    enabledTemplates,
    loading,
    error,
    updateTemplates,
    getTemplateById,
    getEnabledTemplateByValue,
    refreshTemplates: loadTemplates
  };
};

// Export the event system for use in settings
export const notifyTemplateChange = () => {
  templateStorageEvents.notify();
};

// Export default templates for reference
export { defaultTemplates };
export type { Template };

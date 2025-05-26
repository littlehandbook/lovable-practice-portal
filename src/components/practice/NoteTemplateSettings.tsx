import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define template structure
interface TemplateField {
  key: string;
  label: string;
  description?: string;
}

interface Template {
  id: string;
  label: string;
  value: string;
  fields: TemplateField[];
  isEnabled: boolean;
  isCustom: boolean;
}

// Predefined templates with descriptions
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

export function NoteTemplateSettings() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    label: '',
    fields: [{ key: 'field1', label: 'Field 1' }],
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, isEnabled: !template.isEnabled }
          : template
      )
    );
    setHasUnsavedChanges(true);
  };

  const deleteCustomTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    setHasUnsavedChanges(true);
  };

  const addFieldToNewTemplate = () => {
    const fieldCount = newTemplate.fields?.length || 0;
    setNewTemplate(prev => ({
      ...prev,
      fields: [
        ...(prev.fields || []),
        { key: `field${fieldCount + 1}`, label: `Field ${fieldCount + 1}` }
      ]
    }));
  };

  const updateNewTemplateField = (index: number, key: 'key' | 'label' | 'description', value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields?.map((field, i) => 
        i === index ? { ...field, [key]: value } : field
      ) || []
    }));
  };

  const removeFieldFromNewTemplate = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index) || []
    }));
  };

  const saveNewTemplate = () => {
    if (!newTemplate.label || !newTemplate.fields?.length) return;

    const template: Template = {
      id: `custom_${Date.now()}`,
      label: newTemplate.label,
      value: newTemplate.label.toLowerCase().replace(/\s+/g, '_'),
      fields: newTemplate.fields,
      isEnabled: true,
      isCustom: true,
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ label: '', fields: [{ key: 'field1', label: 'Field 1' }] });
    setShowCreateForm(false);
    setHasUnsavedChanges(true);
  };

  const saveAllTemplates = async () => {
    setSaving(true);
    try {
      // Simulate API call to save template settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      toast({
        title: 'Success',
        description: 'Template settings saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Note Templates</CardTitle>
          <CardDescription>
            Manage which templates appear in the note editor and create custom templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template List */}
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={template.isEnabled}
                    onCheckedChange={() => toggleTemplate(template.id)}
                  />
                  <div>
                    <h4 className="font-medium">{template.label}</h4>
                    <p className="text-sm text-gray-500">
                      {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                      {template.isCustom && ' • Custom template'}
                    </p>
                  </div>
                </div>
                {template.isCustom && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template.id)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCustomTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Create New Template Button */}
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Template
            </Button>
          )}

          {/* Create New Template Form */}
          {showCreateForm && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Create Custom Template</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplate.label || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Template Fields</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFieldToNewTemplate}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>

                {newTemplate.fields?.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-3">
                      <Input
                        placeholder="Field key"
                        value={field.key}
                        onChange={(e) => updateNewTemplateField(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Field label"
                        value={field.label}
                        onChange={(e) => updateNewTemplateField(index, 'label', e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Description (optional)"
                        value={field.description || ''}
                        onChange={(e) => updateNewTemplateField(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFieldFromNewTemplate(index)}
                        disabled={newTemplate.fields?.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={saveNewTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          )}

          {/* Main Save Button */}
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
              onClick={saveAllTemplates}
              disabled={!hasUnsavedChanges || saving}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNoteTemplates, notifyTemplateChange, type Template } from '@/hooks/useNoteTemplates';

export function NoteTemplateSettings() {
  const { templates, updateTemplates, loading, error } = useNoteTemplates();
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    label: '',
    fields: [{ key: 'field1', label: 'Field 1' }],
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Reset unsaved changes when templates load
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [templates]);

  const toggleTemplate = (templateId: string) => {
    const updatedTemplates = templates.map(template => 
      template.id === templateId 
        ? { ...template, isEnabled: !template.isEnabled }
        : template
    );
    updateTemplates(updatedTemplates);
    setHasUnsavedChanges(true);
  };

  const deleteCustomTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    updateTemplates(updatedTemplates);
    setHasUnsavedChanges(true);
    toast({
      title: 'Template Deleted',
      description: 'Custom template has been removed.'
    });
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
    if (!newTemplate.label || !newTemplate.fields?.length) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a template name and at least one field.',
        variant: 'destructive'
      });
      return;
    }

    const template: Template = {
      id: `custom_${Date.now()}`,
      label: newTemplate.label,
      value: newTemplate.label.toLowerCase().replace(/\s+/g, '_'),
      fields: newTemplate.fields,
      isEnabled: true,
      isCustom: true,
    };

    const updatedTemplates = [...templates, template];
    updateTemplates(updatedTemplates);
    setNewTemplate({ label: '', fields: [{ key: 'field1', label: 'Field 1' }] });
    setShowCreateForm(false);
    setHasUnsavedChanges(true);
    
    toast({
      title: 'Template Created',
      description: `"${template.label}" template has been added.`
    });
  };

  const saveAllTemplates = async () => {
    setSaving(true);
    try {
      // The templates are already saved via updateTemplates, but we simulate
      // an API call here for consistency with the UI feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Notify other components that templates have been saved
      notifyTemplateChange();
      
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Note Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Note Templates</CardTitle>
          <CardDescription>Error loading templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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

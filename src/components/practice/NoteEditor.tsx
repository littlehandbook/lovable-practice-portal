
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNoteTemplates, type Template } from "@/hooks/useNoteTemplates";

interface NoteEditorProps {
  onSave: (noteData: { template: string; content: Record<string, string>; sessionDate: Date }) => void;
  onCancel: () => void;
  initialData?: { template: string; content: Record<string, string>; sessionDate?: Date };
  availableTemplates?: Template[];
}

export function NoteEditor({ onSave, onCancel, initialData, availableTemplates }: NoteEditorProps) {
  const { enabledTemplates: hookTemplates, loading, error, refreshTemplates } = useNoteTemplates();
  
  // Use the prop if provided, otherwise fall back to hook
  const templatesToShow = availableTemplates ?? hookTemplates;
  
  const [template, setTemplate] = useState<string>('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('NoteEditor - Templates to show:', templatesToShow);
    console.log('NoteEditor - Available templates prop:', availableTemplates);
    console.log('NoteEditor - Hook templates:', hookTemplates);
    console.log('NoteEditor - Loading:', loading);
    console.log('NoteEditor - Error:', error);
  }, [templatesToShow, availableTemplates, hookTemplates, loading, error]);

  // Initialize form when templates load or initial data changes
  useEffect(() => {
    // If we have availableTemplates prop, don't wait for hook loading
    const isLoading = !availableTemplates && loading;
    
    if (isLoading) return;

    if (initialData) {
      setTemplate(initialData.template || '');
      setFields(initialData.content || {});
      setSessionDate(initialData.sessionDate || new Date());
    } else if (templatesToShow.length > 0) {
      // Set default template to first available template
      const defaultTemplate = templatesToShow[0]?.value || '';
      console.log('Setting default template:', defaultTemplate);
      setTemplate(defaultTemplate);
      
      if (defaultTemplate) {
        const tmpl = templatesToShow.find((t) => t.value === defaultTemplate);
        if (tmpl) {
          const init: Record<string, string> = {};
          tmpl.fields.forEach((f) => (init[f.key] = ""));
          setFields(init);
        }
      }
    }
  }, [templatesToShow, initialData, loading, availableTemplates]);

  // Initialize fields when template changes
  const handleTemplateChange = (value: string) => {
    console.log('Template changed to:', value);
    setTemplate(value);
    setValidationError(null);
    const tmpl = templatesToShow.find((t) => t.value === value);
    if (tmpl) {
      const init: Record<string, string> = {};
      tmpl.fields.forEach((f) => (init[f.key] = ""));
      setFields(init);
      console.log('Fields initialized for template:', tmpl.label, init);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setValidationError(null);

    // Validate template selection
    if (!template) {
      setValidationError("Please select a template.");
      return;
    }

    // Validate required fields
    const hasEmptyFields = Object.values(fields).some(value => !value.trim());
    if (hasEmptyFields) {
      setValidationError("Please fill out all fields before saving.");
      return;
    }
    
    onSave({ template, content: fields, sessionDate });
  };

  // Get current template fields
  const currentTemplate = templatesToShow.find((t) => t.value === template);
  const fieldDefs = currentTemplate?.fields || [];

  // Loading state (only if using hook and no prop provided)
  if (!availableTemplates && loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2 text-gray-600">Loading templates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (only if using hook and no prop provided)
  if (!availableTemplates && error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading templates: {error}</span>
            <Button variant="outline" className="ml-4" onClick={refreshTemplates}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No templates available
  if (templatesToShow.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8 text-gray-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div className="text-center">
              <p>No templates are currently available.</p>
              <p className="text-sm mt-1">
                {availableTemplates ? 'No templates provided.' : 'Please enable at least one template in Settings.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templatesToShow.map((t) => (
                  <SelectItem key={t.id} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Debug info */}
            <div className="text-xs text-gray-500">
              Current: {template}, Available: {templatesToShow.length} 
              {availableTemplates ? ' (from prop)' : ' (from hook)'}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Session Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sessionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sessionDate ? format(sessionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sessionDate}
                  onSelect={(date) => date && setSessionDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          {fieldDefs.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.description && (
                  <span className="text-sm text-gray-500 font-normal block">
                    {field.description}
                  </span>
                )}
              </Label>
              <Textarea
                id={field.key}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={fields[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="min-h-[100px] resize-y"
              />
            </div>
          ))}
        </div>

        {validationError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {validationError}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
            Save Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

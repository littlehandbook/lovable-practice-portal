
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the structure of a template
interface Template {
  id: string;
  label: string;
  value: string;
  fields: { key: string; label: string; description?: string }[];
  isEnabled: boolean;
  isCustom: boolean;
}

interface NoteEditorProps {
  onSave: (noteData: { template: string; content: Record<string, string> }) => void;
  onCancel: () => void;
  initialData?: { template: string; content: Record<string, string> };
  availableTemplates?: Template[];
}

export function NoteEditor({ onSave, onCancel, initialData, availableTemplates = [] }: NoteEditorProps) {
  // Filter to only show enabled templates
  const enabledTemplates = availableTemplates.filter(template => template.isEnabled);
  
  const [template, setTemplate] = useState<string>(initialData?.template || (enabledTemplates[0]?.value || "free"));
  const [fields, setFields] = useState<Record<string, string>>(initialData?.content || { content: "" });
  const [error, setError] = useState<string | null>(null);

  // Initialize fields when template changes
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    setError(null);
    const tmpl = enabledTemplates.find((t) => t.value === value);
    if (tmpl) {
      const init: Record<string, string> = {};
      tmpl.fields.forEach((f) => (init[f.key] = ""));
      setFields(init);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Validate required fields
    const hasEmptyFields = Object.values(fields).some(value => !value.trim());
    if (hasEmptyFields) {
      setError("Please fill out all fields before saving.");
      return;
    }
    
    onSave({ template, content: fields });
  };

  // Get current template fields
  const currentTemplate = enabledTemplates.find((t) => t.value === template);
  const fieldDefs = currentTemplate?.fields || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template">Note Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {enabledTemplates.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
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

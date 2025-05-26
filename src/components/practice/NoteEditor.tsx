
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the structure of a template
interface Template {
  label: string;
  value: string;
  fields: { key: string; label: string; description?: string }[];
}

// Predefined note templates (these would come from settings in a real app)
const predefinedTemplates: Template[] = [
  {
    label: "Free Field",
    value: "free",
    fields: [{ key: "content", label: "Session Notes" }],
  },
  {
    label: "SOAP Notes",
    value: "soap",
    fields: [
      { key: "subjective", label: "Subjective", description: "Client's perspective, feelings, and reported experiences" },
      { key: "objective", label: "Objective", description: "Observable behaviors, appearance, and factual data" },
      { key: "assessment", label: "Assessment", description: "Clinical interpretation and progress analysis" },
      { key: "plan", label: "Plan", description: "Future treatment course and next steps" },
    ],
  },
  {
    label: "BIRP Notes",
    value: "birp",
    fields: [
      { key: "behavior", label: "Behavior", description: "Observable and reported behaviors" },
      { key: "intervention", label: "Intervention", description: "Therapeutic interventions used" },
      { key: "response", label: "Response", description: "Client's response to interventions" },
      { key: "plan", label: "Plan", description: "Future session plans and strategies" },
    ],
  },
  {
    label: "DAP Notes",
    value: "dap",
    fields: [
      { key: "data", label: "Data", description: "Combined subjective and objective information" },
      { key: "assessment", label: "Assessment", description: "Clinical assessment of the data" },
      { key: "plan", label: "Plan", description: "Future treatment plan" },
    ],
  },
  {
    label: "PIRP Notes",
    value: "pirp",
    fields: [
      { key: "problem", label: "Problem", description: "Specific problems addressed in session" },
      { key: "intervention", label: "Intervention", description: "Interventions used for problems" },
      { key: "response", label: "Response", description: "Client's response to interventions" },
      { key: "plan", label: "Plan", description: "Future plan for addressing problems" },
    ],
  },
  {
    label: "GIRP Notes",
    value: "girp",
    fields: [
      { key: "goal", label: "Goal", description: "Client's treatment goals addressed" },
      { key: "intervention", label: "Intervention", description: "Interventions aimed at goals" },
      { key: "response", label: "Response", description: "Client's response in relation to goals" },
      { key: "plan", label: "Plan", description: "Continued work on goals" },
    ],
  },
];

interface NoteEditorProps {
  onSave: (noteData: { template: string; content: Record<string, string> }) => void;
  onCancel: () => void;
  initialData?: { template: string; content: Record<string, string> };
}

export function NoteEditor({ onSave, onCancel, initialData }: NoteEditorProps) {
  const [template, setTemplate] = useState<string>(initialData?.template || "free");
  const [fields, setFields] = useState<Record<string, string>>(initialData?.content || { content: "" });
  const [error, setError] = useState<string | null>(null);

  // Initialize fields when template changes
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    setError(null);
    const tmpl = predefinedTemplates.find((t) => t.value === value);
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
  const currentTemplate = predefinedTemplates.find((t) => t.value === template);
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
              {predefinedTemplates.map((t) => (
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

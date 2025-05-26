
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

// Define the structure of a template
interface Template {
  label: string;
  value: string;
  fields: { key: string; label: string }[];
}

// Predefined note templates
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
      { key: "subjective", label: "Subjective - Client's perspective, feelings, and reported experiences" },
      { key: "objective", label: "Objective - Observable behaviors, appearance, and factual data" },
      { key: "assessment", label: "Assessment - Clinical interpretation and progress analysis" },
      { key: "plan", label: "Plan - Future treatment course and next steps" },
    ],
  },
  {
    label: "BIRP Notes",
    value: "birp",
    fields: [
      { key: "behavior", label: "Behavior - Observable and reported behaviors" },
      { key: "intervention", label: "Intervention - Therapeutic interventions used" },
      { key: "response", label: "Response - Client's response to interventions" },
      { key: "plan", label: "Plan - Future session plans and strategies" },
    ],
  },
  {
    label: "DAP Notes",
    value: "dap",
    fields: [
      { key: "data", label: "Data - Combined subjective and objective information" },
      { key: "assessment", label: "Assessment - Clinical assessment of the data" },
      { key: "plan", label: "Plan - Future treatment plan" },
    ],
  },
  {
    label: "PIRP Notes",
    value: "pirp",
    fields: [
      { key: "problem", label: "Problem - Specific problems addressed in session" },
      { key: "intervention", label: "Intervention - Interventions used for problems" },
      { key: "response", label: "Response - Client's response to interventions" },
      { key: "plan", label: "Plan - Future plan for addressing problems" },
    ],
  },
  {
    label: "GIRP Notes",
    value: "girp",
    fields: [
      { key: "goal", label: "Goal - Client's treatment goals addressed" },
      { key: "intervention", label: "Intervention - Interventions aimed at goals" },
      { key: "response", label: "Response - Client's response in relation to goals" },
      { key: "plan", label: "Plan - Continued work on goals" },
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
  const [customFields, setCustomFields] = useState<{ key: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize fields when template changes
  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    setError(null);
    if (value === "custom") {
      setCustomFields([]);
      setFields({});
    } else {
      const tmpl = predefinedTemplates.find((t) => t.value === value);
      if (tmpl) {
        const init: Record<string, string> = {};
        tmpl.fields.forEach((f) => (init[f.key] = ""));
        setFields(init);
      }
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomField = () => {
    const key = `field_${customFields.length + 1}`;
    const newField = { key, label: "New Field" };
    setCustomFields((prev) => [...prev, newField]);
    setFields((prev) => ({ ...prev, [key]: "" }));
  };

  const removeCustomField = (index: number) => {
    const fieldToRemove = customFields[index];
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
    setFields((prev) => {
      const updated = { ...prev };
      delete updated[fieldToRemove.key];
      return updated;
    });
  };

  const handleCustomLabelChange = (index: number, label: string) => {
    setCustomFields((prev) => {
      const updated = [...prev];
      updated[index].label = label;
      return updated;
    });
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

  // Determine which fields to render
  const fieldDefs =
    template === "custom"
      ? customFields
      : predefinedTemplates.find((t) => t.value === template)?.fields || [];

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
              <SelectItem value="custom">Custom Template</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {template === "custom" && (
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {fieldDefs.map((field, idx) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                {template === "custom" ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      type="text"
                      placeholder="Field Label"
                      value={field.label}
                      onChange={(e) => handleCustomLabelChange(idx, e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomField(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor={field.key}>{field.label}</Label>
                )}
              </div>
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

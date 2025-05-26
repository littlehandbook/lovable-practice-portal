
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  onSave: (noteData: { template: string; content: Record<string, string>; sessionDate: Date }) => void;
  onCancel: () => void;
  initialData?: { template: string; content: Record<string, string>; sessionDate?: Date };
  availableTemplates?: Template[];
}

export function NoteEditor({ onSave, onCancel, initialData, availableTemplates = [] }: NoteEditorProps) {
  // Filter to only show enabled templates
  const enabledTemplates = availableTemplates.filter(template => template.isEnabled);
  
  const [template, setTemplate] = useState<string>(initialData?.template || (enabledTemplates[0]?.value || "free"));
  const [fields, setFields] = useState<Record<string, string>>(initialData?.content || { content: "" });
  const [sessionDate, setSessionDate] = useState<Date>(initialData?.sessionDate || new Date());
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
    
    onSave({ template, content: fields, sessionDate });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
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

'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/types/form-builder';
import { AdvancedValidationPanel } from './AdvancedValidationPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FieldConfigPanelProps {
  field: FormField | null;
  allFields?: FormField[];
  onSave: (field: FormField) => void;
  onClose: () => void;
}

export function FieldConfigPanel({ field, allFields = [], onSave, onClose }: FieldConfigPanelProps) {
  const [editedField, setEditedField] = useState<FormField | null>(field);

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  if (!editedField) return null;

  const handleSave = () => {
    onSave(editedField);
    onClose();
  };

  const updateField = (updates: Partial<FormField>) => {
    setEditedField(prev => prev ? { ...prev, ...updates } : null);
  };

  const addOption = () => {
    const options = editedField.options || [];
    updateField({ options: [...options, `Option ${options.length + 1}`] });
  };

  const updateOption = (index: number, value: string) => {
    const options = [...(editedField.options || [])];
    options[index] = value;
    updateField({ options });
  };

  const removeOption = (index: number) => {
    const options = editedField.options?.filter((_, i) => i !== index);
    updateField({ options });
  };

  const showOptions = ['dropdown', 'checkbox', 'radio'].includes(editedField.type);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-border shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-navy">Field Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
          <X className="size-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="label">Label *</Label>
          <Input
            id="label"
            value={editedField.label}
            onChange={(e) => updateField({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        {/* Placeholder */}
        {!['checkbox', 'radio'].includes(editedField.type) && (
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={editedField.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        {/* Help Text */}
        <div className="space-y-2">
          <Label htmlFor="helpText">Help Text</Label>
          <Textarea
            id="helpText"
            value={editedField.helpText || ''}
            onChange={(e) => updateField({ helpText: e.target.value })}
            placeholder="Add helpful instructions"
            rows={2}
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="required">Required Field</Label>
          <Switch
            id="required"
            checked={editedField.required}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
        </div>

        {/* Options for dropdown, checkbox, radio */}
        {showOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="gap-2"
              >
                <Plus className="size-3" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {editedField.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="size-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Value */}
        {!['file', 'checkbox', 'radio'].includes(editedField.type) && (
          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              value={editedField.defaultValue || ''}
              onChange={(e) => updateField({ defaultValue: e.target.value })}
              placeholder="Enter default value"
            />
          </div>
        )}
      </div>

      {/* Advanced Validation Tab */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="validation">Advanced Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Existing content stays here - will be wrapped */}
        </TabsContent>
        
        <TabsContent value="validation" className="mt-4">
          <AdvancedValidationPanel
            field={editedField}
            allFields={allFields}
            validationRules={editedField.advancedValidation || []}
            onRulesChange={(rules) => updateField({ advancedValidation: rules })}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 bg-white border-t border-border p-4 flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1 gradient-primary text-white">
          Save Field
        </Button>
      </div>
    </div>
  );
}

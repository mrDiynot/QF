'use client';

/**
 * Enhanced Form Builder Component
 * Drag-and-drop form builder with multiple field types
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Type,
  Mail,
  Phone,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Hash,
  Link,
  Star,
  Upload,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Settings,
  Eye,
  Save,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { FormField } from '@/types/api';

// Extended field types
type ExtendedFieldType = FormField['type'] | 'number' | 'date' | 'url' | 'rating' | 'file';

interface ExtendedFormField extends Omit<FormField, 'type'> {
  type: ExtendedFieldType;
  description?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const FIELD_TYPES: Array<{
  type: ExtendedFieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  { type: 'text', label: 'Text', icon: <Type className="size-4" />, description: 'Single line text input' },
  { type: 'email', label: 'Email', icon: <Mail className="size-4" />, description: 'Email address field' },
  { type: 'phone', label: 'Phone', icon: <Phone className="size-4" />, description: 'Phone number field' },
  { type: 'textarea', label: 'Text Area', icon: <AlignLeft className="size-4" />, description: 'Multi-line text' },
  { type: 'select', label: 'Dropdown', icon: <List className="size-4" />, description: 'Single selection' },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="size-4" />, description: 'Multiple selection' },
  { type: 'radio', label: 'Radio', icon: <Circle className="size-4" />, description: 'Single choice' },
  { type: 'number', label: 'Number', icon: <Hash className="size-4" />, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: <Calendar className="size-4" />, description: 'Date picker' },
  { type: 'url', label: 'URL', icon: <Link className="size-4" />, description: 'Website link' },
  { type: 'rating', label: 'Rating', icon: <Star className="size-4" />, description: 'Star rating' },
  { type: 'file', label: 'File Upload', icon: <Upload className="size-4" />, description: 'File attachment' },
];

interface FormBuilderProps {
  initialFields?: ExtendedFormField[];
  onSave?: (fields: ExtendedFormField[]) => void;
  className?: string;
}

export function FormBuilder({ initialFields = [], onSave, className }: FormBuilderProps) {
  const [fields, setFields] = useState<ExtendedFormField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // Generate unique ID
  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new field
  const addField = useCallback((type: ExtendedFieldType) => {
    const fieldConfig = FIELD_TYPES.find(f => f.type === type);
    const newField: ExtendedFormField = {
      id: generateId(),
      type,
      label: fieldConfig?.label || 'New Field',
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'checkbox' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, []);

  // Update field
  const updateField = useCallback((id: string, updates: Partial<ExtendedFormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  // Delete field
  const deleteField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  }, [selectedFieldId]);

  // Duplicate field
  const duplicateField = useCallback((id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      const newField = { ...field, id: generateId(), label: `${field.label} (Copy)` };
      const index = fields.findIndex(f => f.id === id);
      setFields(prev => [...prev.slice(0, index + 1), newField, ...prev.slice(index + 1)]);
    }
  }, [fields]);

  // Move field
  const moveField = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fields.length) return;
    setFields(prev => {
      const newFields = [...prev];
      const [removed] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, removed);
      return newFields;
    });
  }, [fields.length]);

  // Drag handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveField(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save form
  const handleSave = () => {
    onSave?.(fields);
    toast.success('Form saved successfully');
  };

  return (
    <div className={cn("grid lg:grid-cols-12 gap-6", className)}>
      {/* Field Palette */}
      <Card className="lg:col-span-3 p-4 h-fit">
        <h3 className="font-semibold text-foreground mb-4">Add Fields</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map((fieldType) => (
            <button
              key={fieldType.type}
              onClick={() => addField(fieldType.type)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-purple-300 hover:bg-primary/5 transition-colors text-center"
            >
              <div className="text-muted-foreground">{fieldType.icon}</div>
              <span className="text-xs font-medium text-foreground/80">{fieldType.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Form Preview */}
      <Card className="lg:col-span-5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">Form Preview</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="size-4" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1">
              <Save className="size-4" />
              Save
            </Button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/60 border-2 border-dashed rounded-xl">
            <Plus className="size-12 mb-4" />
            <p className="text-sm font-medium">No fields yet</p>
            <p className="text-xs">Click a field type to add it</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedFieldId(field.id)}
                className={cn(
                  "group relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedFieldId === field.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border",
                  draggedIndex === index && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="cursor-grab text-muted-foreground/60 hover:text-muted-foreground mt-1">
                    <GripVertical className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{field.label}</span>
                      {field.required && (
                        <Badge variant="outline" className="text-[10px] text-red-500 border-red-200">
                          Required
                        </Badge>
                      )}
                    </div>
                    <FieldPreview field={field} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => { e.stopPropagation(); moveField(index, index - 1); }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => { e.stopPropagation(); moveField(index, index + 1); }}
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Field Settings */}
      <Card className="lg:col-span-4 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="size-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Field Settings</h3>
        </div>

        {selectedField ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={selectedField.label}
                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={selectedField.placeholder || ''}
                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={selectedField.description || ''}
                onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Required</Label>
              <Switch
                checked={selectedField.required}
                onCheckedChange={(v) => updateField(selectedField.id, { required: v })}
              />
            </div>

            {/* Options for select/checkbox/radio */}
            {['select', 'checkbox', 'radio'].includes(selectedField.type) && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {(selectedField.options || []).map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(selectedField.options || [])];
                          newOptions[idx] = e.target.value;
                          updateField(selectedField.id, { options: newOptions });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = (selectedField.options || []).filter((_, i) => i !== idx);
                          updateField(selectedField.id, { options: newOptions });
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                      updateField(selectedField.id, { options: newOptions });
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Validation for text fields */}
            {['text', 'textarea'].includes(selectedField.type) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Length</Label>
                  <Input
                    type="number"
                    value={selectedField.minLength || ''}
                    onChange={(e) => updateField(selectedField.id, { minLength: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Length</Label>
                  <Input
                    type="number"
                    value={selectedField.maxLength || ''}
                    onChange={(e) => updateField(selectedField.id, { maxLength: Number(e.target.value) || undefined })}
                  />
                </div>
              </div>
            )}

            {/* Validation for number fields */}
            {selectedField.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Value</Label>
                  <Input
                    type="number"
                    value={selectedField.min || ''}
                    onChange={(e) => updateField(selectedField.id, { min: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Value</Label>
                  <Input
                    type="number"
                    value={selectedField.max || ''}
                    onChange={(e) => updateField(selectedField.id, { max: Number(e.target.value) || undefined })}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/60">
            <Settings className="size-12 mb-4" />
            <p className="text-sm">Select a field to edit</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Field preview component
function FieldPreview({ field }: { field: ExtendedFormField }) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
    case 'number':
      return (
        <Input
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled
          className="bg-white"
        />
      );
    case 'textarea':
      return (
        <Textarea
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          disabled
          rows={2}
          className="bg-white"
        />
      );
    case 'select':
      return (
        <Select disabled>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={field.placeholder || 'Select an option'} />
          </SelectTrigger>
        </Select>
      );
    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.options || []).slice(0, 3).map((option, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="checkbox" disabled className="rounded" />
              <span className="text-sm text-muted-foreground">{option}</span>
            </div>
          ))}
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || []).slice(0, 3).map((option, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="radio" disabled />
              <span className="text-sm text-muted-foreground">{option}</span>
            </div>
          ))}
        </div>
      );
    case 'date':
      return (
        <Input type="date" disabled className="bg-white" />
      );
    case 'rating':
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="size-6 text-muted-foreground/30" />
          ))}
        </div>
      );
    case 'file':
      return (
        <div className="border-2 border-dashed rounded-lg p-4 text-center text-muted-foreground/60 bg-white">
          <Upload className="size-6 mx-auto mb-2" />
          <p className="text-xs">Click or drag to upload</p>
        </div>
      );
    default:
      return <Input disabled className="bg-white" />;
  }
}

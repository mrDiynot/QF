'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Copy } from 'lucide-react';
import { FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';

interface FormFieldItemProps {
  field: FormField;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
  onDuplicate: (field: FormField) => void;
}

export function FormFieldItem({ field, onEdit, onDelete, onDuplicate }: FormFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-4 rounded-lg border bg-white ${
        isDragging ? 'border-brand-purple shadow-lg opacity-50' : 'border-border hover:border-brand-purple'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-brand-purple"
      >
        <GripVertical className="size-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-text-navy">{field.label}</h4>
          {field.required && (
            <span className="text-xs text-red-600 font-medium">*</span>
          )}
          <span className="text-xs text-text-muted capitalize">{field.type}</span>
        </div>
        {field.placeholder && (
          <p className="text-xs text-text-secondary mt-1">{field.placeholder}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(field)}
          className="size-8 p-0"
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDuplicate(field)}
          className="size-8 p-0"
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(field.id)}
          className="size-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

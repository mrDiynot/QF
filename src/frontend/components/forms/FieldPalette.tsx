'use client';

import { 
  Type, Mail, Phone, Hash, ChevronDown, CheckSquare, 
  Circle, AlignLeft, Calendar, Upload 
} from 'lucide-react';
import { FieldType } from '@/types/form-builder';

interface FieldPaletteProps {
  onFieldSelect: (fieldType: FieldType) => void;
}

const FIELD_TYPES = [
  { type: 'text' as FieldType, icon: Type, label: 'Text', description: 'Single line text input' },
  { type: 'email' as FieldType, icon: Mail, label: 'Email', description: 'Email address field' },
  { type: 'phone' as FieldType, icon: Phone, label: 'Phone', description: 'Phone number field' },
  { type: 'number' as FieldType, icon: Hash, label: 'Number', description: 'Numeric input' },
  { type: 'dropdown' as FieldType, icon: ChevronDown, label: 'Dropdown', description: 'Select from options' },
  { type: 'checkbox' as FieldType, icon: CheckSquare, label: 'Checkbox', description: 'Multiple selection' },
  { type: 'radio' as FieldType, icon: Circle, label: 'Radio', description: 'Single selection' },
  { type: 'textarea' as FieldType, icon: AlignLeft, label: 'Text Area', description: 'Multi-line text' },
  { type: 'date' as FieldType, icon: Calendar, label: 'Date', description: 'Date picker' },
  { type: 'file' as FieldType, icon: Upload, label: 'File Upload', description: 'File attachment' },
];

export function FieldPalette({ onFieldSelect }: FieldPaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-navy mb-3">Field Types</h3>
      <div className="grid grid-cols-2 gap-2">
        {FIELD_TYPES.map((field) => {
          const Icon = field.icon;
          return (
            <button
              key={field.type}
              onClick={() => onFieldSelect(field.type)}
              className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-white hover:border-brand-purple hover:bg-primary/5/50 transition-all group"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="p-1.5 rounded bg-gradient-to-br from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100">
                  <Icon className="size-4 text-brand-purple" />
                </div>
                <span className="text-sm font-medium text-text-navy">{field.label}</span>
              </div>
              <p className="text-xs text-text-secondary text-left">{field.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

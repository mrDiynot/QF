'use client';

import { FormField, FormStyling } from '@/types/form-builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FormPreviewProps {
  fields: FormField[];
  styling: FormStyling;
  formName: string;
}

export function FormPreview({ fields, styling, formName }: FormPreviewProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type === 'phone' ? 'tel' : field.type}
            style={{ borderRadius: `${styling.borderRadius}px` }}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            style={{ borderRadius: `${styling.borderRadius}px` }}
          />
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            style={{ borderRadius: `${styling.borderRadius}px` }}
          />
        );

      case 'select':
        return (
          <Select>
            <SelectTrigger style={{ borderRadius: `${styling.borderRadius}px` }}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${idx}`} />
                <label
                  htmlFor={`${field.id}-${idx}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup>
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option.toLowerCase().replace(/\s+/g, '-')} id={`${field.id}-${idx}`} />
                <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'file':
        return (
          <Input
            {...commonProps}
            type="file"
            style={{ borderRadius: `${styling.borderRadius}px` }}
          />
        );

      default:
        return null;
    }
  };

  const getButtonClass = () => {
    const baseClass = 'w-full font-medium transition-colors';
    switch (styling.buttonStyle) {
      case 'pill':
        return `${baseClass} rounded-full`;
      case 'square':
        return `${baseClass} rounded-none`;
      case 'rounded':
      default:
        return `${baseClass} rounded-lg`;
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto p-8 rounded-2xl shadow-lg"
      style={{
        backgroundColor: styling.backgroundColor,
        fontFamily: styling.fontFamily,
      }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-text-navy">{formName}</h2>
      
      <form className="space-y-6">
        <div className={styling.layout === 'two-column' ? 'grid grid-cols-2 gap-6' : 'space-y-6'}>
          {sortedFields.map((field) => (
            <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
              <Label htmlFor={field.id} className="mb-2 block">
                {field.label}
                {field.required && <span className="text-red-600 ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-text-secondary mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className={getButtonClass()}
          style={{
            backgroundColor: styling.primaryColor,
            color: '#FFFFFF',
          }}
        >
          {styling.buttonText}
        </Button>
      </form>
    </div>
  );
}

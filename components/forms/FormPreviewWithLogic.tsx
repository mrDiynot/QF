'use client';

import { useEffect, useState } from 'react';
import { FormField, FormStyling } from '@/types/form-builder';
import { ConditionalRule, CalculationFormula, getVisibleFields, getRequiredFields, evaluateFormula } from '@/types/conditional-logic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormPreviewWithLogicProps {
  fields: FormField[];
  styling: FormStyling;
  conditionalRules?: ConditionalRule[];
  calculations?: CalculationFormula[];
}

export function FormPreviewWithLogic({ 
  fields, 
  styling, 
  conditionalRules = [],
  calculations = []
}: FormPreviewWithLogicProps) {
  const [formValues, setFormValues] = useState<{ [fieldId: string]: string | number | boolean | string[] | File }>({});
  const [visibleFieldIds, setVisibleFieldIds] = useState<string[]>(fields.map(f => f.id));
  const [requiredFieldIds, setRequiredFieldIds] = useState<string[]>(
    fields.filter(f => f.required).map(f => f.id)
  );

  // Update visible and required fields when form values change
  useEffect(() => {
    const visible = getVisibleFields(fields, conditionalRules, formValues);
    setVisibleFieldIds(visible);

    const baseRequired = fields.filter(f => f.required).map(f => f.id);
    const required = getRequiredFields(baseRequired, conditionalRules, formValues);
    setRequiredFieldIds(required);
  }, [formValues, fields, conditionalRules]);

  // Calculate field values based on formulas
  useEffect(() => {
    calculations.forEach(calc => {
      if (!calc.enabled) return;

      const variables: { [key: string]: number } = {};
      Object.entries(calc.variables).forEach(([varName, fieldId]) => {
        const value = formValues[fieldId];
        variables[varName] = Number(value) || 0;
      });

      const result = evaluateFormula(calc.formula, variables);
      if (result !== null && result !== undefined) {
        setFormValues(prev => ({
          ...prev,
          [calc.targetFieldId]: typeof result === 'number' ? result : String(result)
        }));
      }
    });
  }, [formValues, calculations]);

  const handleFieldChange = (fieldId: string, value: string | number | boolean | string[] | File) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormField) => {
    if (!visibleFieldIds.includes(field.id)) {
      return null;
    }

    const isRequired = requiredFieldIds.includes(field.id);
    const isCalculated = calculations.some(c => c.targetFieldId === field.id && c.enabled);
    const value = formValues[field.id] || '';

    const commonInputProps = {
      id: field.id,
      required: isRequired,
      disabled: isCalculated,
      style: {
        borderColor: styling.primaryColor,
        borderRadius: `${styling.borderRadius}px`,
      },
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            {...commonInputProps}
            type={field.type}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            {...commonInputProps}
            type="number"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonInputProps}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={isCalculated}
          >
            <SelectTrigger style={{ borderRadius: `${styling.borderRadius}px` }}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
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
              <div key={idx} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${idx}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    const newValue = checked
                      ? [...currentValue, option]
                      : currentValue.filter((v: unknown) => v !== option);
                    handleFieldChange(field.id, newValue);
                  }}
                  disabled={isCalculated}
                />
                <label htmlFor={`${field.id}-${idx}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${idx}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  disabled={isCalculated}
                  className="size-4"
                />
                <label htmlFor={`${field.id}-${idx}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            {...commonInputProps}
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );

      case 'file':
        return (
          <Input
            {...commonInputProps}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFieldChange(field.id, file);
            }}
          />
        );

      default:
        return null;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor: styling.primaryColor,
      color: '#ffffff',
    };

    switch (styling.buttonStyle) {
      case 'rounded':
        return { ...baseStyle, borderRadius: '8px' };
      case 'pill':
        return { ...baseStyle, borderRadius: '9999px' };
      case 'square':
      default:
        return { ...baseStyle, borderRadius: '4px' };
    }
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto p-8 rounded-lg"
      style={{
        backgroundColor: styling.backgroundColor,
        fontFamily: styling.fontFamily,
      }}
    >
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => {
          if (!visibleFieldIds.includes(field.id)) return null;

          const isRequired = requiredFieldIds.includes(field.id);
          const isCalculated = calculations.some(c => c.targetFieldId === field.id && c.enabled);

          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-text-navy font-medium">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
                {isCalculated && (
                  <span className="text-xs text-brand-purple ml-2">(Calculated)</span>
                )}
              </Label>
              {field.helpText && (
                <p className="text-sm text-text-secondary">{field.helpText}</p>
              )}
              {renderField(field)}
            </div>
          );
        })}

        <Button
          type="submit"
          className="w-full font-semibold"
          style={getButtonStyle()}
        >
          {styling.buttonText}
        </Button>
      </form>

      {/* Logic Debug Info (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-muted/40 rounded text-xs space-y-2">
          <p><strong>Visible Fields:</strong> {visibleFieldIds.length} / {fields.length}</p>
          <p><strong>Required Fields:</strong> {requiredFieldIds.length}</p>
          <p><strong>Active Rules:</strong> {conditionalRules.filter(r => r.enabled).length}</p>
          <p><strong>Active Calculations:</strong> {calculations.filter(c => c.enabled).length}</p>
        </div>
      )}
    </div>
  );
}

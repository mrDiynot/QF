'use client';
import { CalculationFormula } from '@/types/conditional-logic';
import { FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calculator, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CalculationBuilderProps {
  fields: FormField[];
  calculations: CalculationFormula[];
  onCalculationsChange: (calculations: CalculationFormula[]) => void;
}

export function CalculationBuilder({ fields, calculations, onCalculationsChange }: CalculationBuilderProps) {
  const numericFields = fields.filter(f => f.type === 'number');

  const addCalculation = () => {
    const newCalc: CalculationFormula = {
      id: `calc-${Date.now()}`,
      targetFieldId: numericFields[0]?.id || '',
      formula: '',
      variables: {},
      enabled: true,
    };
    onCalculationsChange([...calculations, newCalc]);
  };

  const updateCalculation = (calcId: string, updates: Partial<CalculationFormula>) => {
    onCalculationsChange(
      calculations.map(calc => (calc.id === calcId ? { ...calc, ...updates } : calc))
    );
  };

  const deleteCalculation = (calcId: string) => {
    onCalculationsChange(calculations.filter(calc => calc.id !== calcId));
  };

  const insertVariable = (calcId: string, fieldId: string) => {
    const calc = calculations.find(c => c.id === calcId);
    if (!calc) return;

    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const varName = `field_${Object.keys(calc.variables).length + 1}`;
    const newVariables = { ...calc.variables, [varName]: fieldId };
    const newFormula = calc.formula + (calc.formula ? ' + ' : '') + varName;

    updateCalculation(calcId, {
      variables: newVariables,
      formula: newFormula,
    });
  };

  const getFieldLabel = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.label || 'Unknown Field';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-brand-purple" />
          <h3 className="text-lg font-semibold text-text-navy">Calculations</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addCalculation}
          className="gap-2"
          disabled={numericFields.length < 2}
        >
          <Plus className="size-4" />
          Add Calculation
        </Button>
      </div>

      {numericFields.length < 2 && (
        <p className="text-sm text-text-secondary">
          Add at least 2 number fields to create calculations
        </p>
      )}

      {calculations.length === 0 && numericFields.length >= 2 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-text-secondary mb-4">
            No calculations yet. Create formulas to automatically calculate field values.
          </p>
          <Button variant="outline" size="sm" onClick={addCalculation} className="gap-2">
            <Plus className="size-4" />
            Create First Calculation
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {calculations.map((calc, index) => (
          <Card key={calc.id} className="p-4">
            <div className="space-y-4">
              {/* Calculation Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-secondary">
                    Calculation {index + 1}
                  </span>
                  <Switch
                    checked={calc.enabled}
                    onCheckedChange={(enabled) => updateCalculation(calc.id, { enabled })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCalculation(calc.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {/* Target Field */}
              <div className="space-y-2">
                <Label className="text-xs text-text-secondary">Calculate value for</Label>
                <Select
                  value={calc.targetFieldId}
                  onValueChange={(value) => updateCalculation(calc.id, { targetFieldId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {numericFields.map(field => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Formula */}
              <div className="space-y-2">
                <Label className="text-xs text-text-secondary">Formula</Label>
                <Textarea
                  value={calc.formula}
                  onChange={(e) => updateCalculation(calc.id, { formula: e.target.value })}
                  placeholder="e.g., field_1 + field_2 * 0.15"
                  rows={2}
                  className="font-mono text-sm"
                />
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <Info className="size-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Use +, -, *, / operators. Variables are mapped to fields below.
                  </span>
                </div>
              </div>

              {/* Variable Mapping */}
              <div className="space-y-2">
                <Label className="text-xs text-text-secondary">Variables</Label>
                <div className="space-y-2">
                  {Object.entries(calc.variables).map(([varName, fieldId]) => (
                    <div key={varName} className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-1 bg-muted rounded text-brand-purple font-mono">
                        {varName}
                      </code>
                      <span className="text-text-secondary">=</span>
                      <span className="text-text-navy">{getFieldLabel(fieldId)}</span>
                    </div>
                  ))}
                </div>
                <Select
                  onValueChange={(fieldId) => insertVariable(calc.id, fieldId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add field to formula..." />
                  </SelectTrigger>
                  <SelectContent>
                    {numericFields
                      .filter(f => f.id !== calc.targetFieldId)
                      .map(field => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculation Preview */}
              {calc.formula && Object.keys(calc.variables).length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    <span className="font-medium">Preview:</span>{' '}
                    <span className="font-medium text-brand-purple">
                      {getFieldLabel(calc.targetFieldId)}
                    </span>{' '}
                    = {calc.formula}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

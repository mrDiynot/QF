'use client';

import { AdvancedValidationRule, ValidationType } from '@/types/advanced-validation';
import { FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Shield, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdvancedValidationPanelProps {
  field: FormField;
  allFields: FormField[];
  validationRules: AdvancedValidationRule[];
  onRulesChange: (rules: AdvancedValidationRule[]) => void;
}

export function AdvancedValidationPanel({ 
  field, 
  allFields, 
  validationRules, 
  onRulesChange 
}: AdvancedValidationPanelProps) {
  const validationTypes: { value: ValidationType; label: string; description: string }[] = [
    { value: 'required', label: 'Required', description: 'Field must have a value' },
    { value: 'email', label: 'Email', description: 'Must be valid email format' },
    { value: 'phone', label: 'Phone', description: 'Must be valid phone number' },
    { value: 'url', label: 'URL', description: 'Must be valid URL' },
    { value: 'regex', label: 'Custom Pattern', description: 'Match custom regex pattern' },
    { value: 'minLength', label: 'Min Length', description: 'Minimum character count' },
    { value: 'maxLength', label: 'Max Length', description: 'Maximum character count' },
    { value: 'min', label: 'Min Value', description: 'Minimum numeric value' },
    { value: 'max', label: 'Max Value', description: 'Maximum numeric value' },
    { value: 'minDate', label: 'Min Date', description: 'Earliest allowed date' },
    { value: 'maxDate', label: 'Max Date', description: 'Latest allowed date' },
    { value: 'fileSize', label: 'File Size', description: 'Maximum file size' },
    { value: 'fileType', label: 'File Type', description: 'Allowed file types' },
    { value: 'crossField', label: 'Cross-Field', description: 'Compare with another field' },
  ];

  const addRule = () => {
    const newRule: AdvancedValidationRule = {
      id: `validation-${Date.now()}`,
      type: 'required',
      errorMessage: '',
      enabled: true,
    };
    onRulesChange([...validationRules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<AdvancedValidationRule>) => {
    onRulesChange(
      validationRules.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const deleteRule = (ruleId: string) => {
    onRulesChange(validationRules.filter(rule => rule.id !== ruleId));
  };

  const getPatternExample = (type: ValidationType): string => {
    switch (type) {
      case 'email':
        return 'example@domain.com';
      case 'phone':
        return '+1 (555) 123-4567';
      case 'url':
        return 'https://example.com';
      case 'regex':
        return '^[A-Z]{2}\\d{4}$';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-brand-purple" />
          <div>
            <h3 className="text-lg font-semibold text-text-navy">Validation Rules</h3>
            <p className="text-xs text-text-secondary">for {field.label}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          className="gap-2"
        >
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {validationRules.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-text-secondary mb-4">
            No validation rules yet. Add rules to validate user input.
          </p>
          <Button variant="outline" size="sm" onClick={addRule} className="gap-2">
            <Plus className="size-4" />
            Create First Rule
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {validationRules.map((rule, index) => (
          <Card key={rule.id} className="p-4">
            <div className="space-y-4">
              {/* Rule Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-secondary">
                    Rule {index + 1}
                  </span>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => updateRule(rule.id, { enabled })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {/* Validation Type */}
              <div className="space-y-2">
                <Label className="text-xs text-text-secondary">Validation Type</Label>
                <Select
                  value={rule.type}
                  onValueChange={(value: ValidationType) => 
                    updateRule(rule.id, { type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-text-muted">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input (conditional based on type) */}
              {['minLength', 'maxLength', 'min', 'max'].includes(rule.type) && (
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Value</Label>
                  <Input
                    type="number"
                    value={rule.value || ''}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>
              )}

              {['minDate', 'maxDate'].includes(rule.type) && (
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Date</Label>
                  <Input
                    type="date"
                    value={rule.value || ''}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  />
                </div>
              )}

              {/* Regex Pattern */}
              {rule.type === 'regex' && (
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Regular Expression Pattern</Label>
                  <Input
                    value={rule.pattern || ''}
                    onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                    placeholder={getPatternExample(rule.type)}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-start gap-2 text-xs text-text-muted">
                    <Info className="size-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Use JavaScript regex syntax. Example: ^[A-Z]{'{2}'}\\d{'{4}'}$ for 2 letters + 4 digits
                    </span>
                  </div>
                </div>
              )}

              {/* File Size */}
              {rule.type === 'fileSize' && (
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={rule.maxFileSize ? rule.maxFileSize / (1024 * 1024) : ''}
                    onChange={(e) => updateRule(rule.id, { 
                      maxFileSize: Number(e.target.value) * 1024 * 1024 
                    })}
                    placeholder="5"
                    step="0.1"
                  />
                </div>
              )}

              {/* File Types */}
              {rule.type === 'fileType' && (
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Allowed File Types (MIME types, comma-separated)</Label>
                  <Input
                    value={rule.allowedFileTypes?.join(', ') || ''}
                    onChange={(e) => updateRule(rule.id, { 
                      allowedFileTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="image/jpeg, image/png, application/pdf"
                  />
                </div>
              )}

              {/* Cross-Field Validation */}
              {rule.type === 'crossField' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs text-text-secondary">Compare with Field</Label>
                    <Select
                      value={rule.compareFieldId || ''}
                      onValueChange={(value) => updateRule(rule.id, { compareFieldId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allFields
                          .filter(f => f.id !== field.id)
                          .map(f => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-text-secondary">Comparison</Label>
                    <Select
                      value={rule.compareOperator || 'greater_than'}
                      onValueChange={(value) => updateRule(rule.id, { 
                        compareOperator: value as 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="greater_than_or_equal">Greater Than or Equal</SelectItem>
                        <SelectItem value="less_than_or_equal">Less Than or Equal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Error Message */}
              <div className="space-y-2">
                <Label className="text-xs text-text-secondary">Custom Error Message</Label>
                <Textarea
                  value={rule.errorMessage}
                  onChange={(e) => updateRule(rule.id, { errorMessage: e.target.value })}
                  placeholder="Enter custom error message (optional)"
                  rows={2}
                />
              </div>

              {/* Example */}
              {getPatternExample(rule.type) && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-text-secondary">
                    <span className="font-medium">Example:</span> {getPatternExample(rule.type)}
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

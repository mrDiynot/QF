'use client';
import { ConditionalRule, ConditionOperator, ConditionalAction } from '@/types/conditional-logic';
import { FormField } from '@/types/form-builder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ConditionalLogicPanelProps {
  fields: FormField[];
  rules: ConditionalRule[];
  onRulesChange: (rules: ConditionalRule[]) => void;
}

export function ConditionalLogicPanel({ fields, rules, onRulesChange }: ConditionalLogicPanelProps) {

  const operatorOptions: { value: ConditionOperator; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_than_or_equal', label: 'Greater Than or Equal' },
    { value: 'less_than_or_equal', label: 'Less Than or Equal' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
  ];

  const actionOptions: { value: ConditionalAction; label: string }[] = [
    { value: 'show', label: 'Show Field' },
    { value: 'hide', label: 'Hide Field' },
    { value: 'require', label: 'Make Required' },
    { value: 'skip_to', label: 'Skip To Field' },
  ];

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      sourceFieldId: fields[0]?.id || '',
      operator: 'equals',
      value: '',
      action: 'show',
      targetFieldId: fields[1]?.id || '',
      enabled: true,
    };
    onRulesChange([...rules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    onRulesChange(
      rules.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const deleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
  };

  const getFieldLabel = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.label || 'Unknown Field';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="size-5 text-brand-purple" />
          <h3 className="text-lg font-semibold text-text-navy">Conditional Logic</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addRule}
          className="gap-2"
          disabled={fields.length < 2}
        >
          <Plus className="size-4" />
          Add Rule
        </Button>
      </div>

      {fields.length < 2 && (
        <p className="text-sm text-text-secondary">
          Add at least 2 fields to create conditional logic rules
        </p>
      )}

      {rules.length === 0 && fields.length >= 2 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-text-secondary mb-4">
            No conditional rules yet. Create rules to show/hide fields based on user responses.
          </p>
          <Button variant="outline" size="sm" onClick={addRule} className="gap-2">
            <Plus className="size-4" />
            Create First Rule
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {rules.map((rule, index) => (
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

              {/* Rule Configuration */}
              <div className="grid gap-4">
                {/* When Field */}
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">When this field</Label>
                  <Select
                    value={rule.sourceFieldId}
                    onValueChange={(value) => updateRule(rule.id, { sourceFieldId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator */}
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Condition</Label>
                  <Select
                    value={rule.operator}
                    onValueChange={(value: ConditionOperator) => 
                      updateRule(rule.id, { operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value (hide for is_empty/is_not_empty) */}
                {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                  <div className="space-y-2">
                    <Label className="text-xs text-text-secondary">Value</Label>
                    <Input
                      value={String(rule.value ?? '')}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Enter value to compare"
                    />
                  </div>
                )}

                {/* Action */}
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Then</Label>
                  <Select
                    value={rule.action}
                    onValueChange={(value: ConditionalAction) => 
                      updateRule(rule.id, { action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Field */}
                <div className="space-y-2">
                  <Label className="text-xs text-text-secondary">Target field</Label>
                  <Select
                    value={rule.targetFieldId}
                    onValueChange={(value) => updateRule(rule.id, { targetFieldId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields
                        .filter(f => f.id !== rule.sourceFieldId)
                        .map(field => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rule Summary */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-text-secondary">
                  <span className="font-medium">Summary:</span> When{' '}
                  <span className="font-medium text-brand-purple">
                    {getFieldLabel(rule.sourceFieldId)}
                  </span>{' '}
                  {rule.operator.replace(/_/g, ' ')}{' '}
                  {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                    <span className="font-medium">&quot;{rule.value}&quot;</span>
                  )}
                  , {rule.action.replace(/_/g, ' ')}{' '}
                  <span className="font-medium text-brand-purple">
                    {getFieldLabel(rule.targetFieldId)}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

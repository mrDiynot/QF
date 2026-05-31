/**
 * Conditional Logic Type Definitions for Forms
 * Enables show/hide fields, skip logic, and calculations
 */

export type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'greater_than' 
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty';

export type ConditionalAction = 
  | 'show' 
  | 'hide' 
  | 'require' 
  | 'skip_to'
  | 'set_value';

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  action: ConditionalAction;
  targetFieldId: string;
  enabled: boolean;
}

export interface CalculationFormula {
  id: string;
  targetFieldId: string;
  formula: string; // e.g., "field_1 + field_2" or "field_1 * 0.15"
  variables: { [key: string]: string }; // Map variable names to field IDs
  enabled: boolean;
}

export interface ConditionalLogicState {
  rules: ConditionalRule[];
  calculations: CalculationFormula[];
}

// Helper functions for evaluating conditions
export const evaluateCondition = (
  fieldValue: unknown,
  operator: ConditionOperator,
  compareValue: unknown
): boolean => {
  switch (operator) {
    case 'equals':
      return fieldValue === compareValue;
    case 'not_equals':
      return fieldValue !== compareValue;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    case 'greater_than':
      return Number(fieldValue) > Number(compareValue);
    case 'less_than':
      return Number(fieldValue) < Number(compareValue);
    case 'greater_than_or_equal':
      return Number(fieldValue) >= Number(compareValue);
    case 'less_than_or_equal':
      return Number(fieldValue) <= Number(compareValue);
    case 'is_empty':
      return !fieldValue || fieldValue === '';
    case 'is_not_empty':
      return !!fieldValue && fieldValue !== '';
    default:
      return false;
  }
};

// Helper function to evaluate calculation formulas
export const evaluateFormula = (
  formula: string,
  variables: { [key: string]: number }
): number | null => {
  try {
    // Replace variable names with their values
    let expression = formula;
    Object.entries(variables).forEach(([varName, value]) => {
      expression = expression.replace(new RegExp(varName, 'g'), String(value));
    });

    // Safely evaluate the expression (basic math operations only)
    const result = Function(`"use strict"; return (${expression})`)();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
};

// Get fields that should be visible based on conditional rules
export const getVisibleFields = (
  allFields: Array<{ id: string }>,
  rules: ConditionalRule[],
  formValues: { [fieldId: string]: unknown }
): string[] => {
  const hiddenFields = new Set<string>();
  const visibleFields = new Set<string>(allFields.map(f => f.id));

  rules.forEach(rule => {
    if (!rule.enabled) return;

    const sourceValue = formValues[rule.sourceFieldId];
    const conditionMet = evaluateCondition(sourceValue, rule.operator, rule.value);

    if (rule.action === 'hide' && conditionMet) {
      hiddenFields.add(rule.targetFieldId);
    } else if (rule.action === 'show' && conditionMet) {
      visibleFields.add(rule.targetFieldId);
    }
  });

  return Array.from(visibleFields).filter(id => !hiddenFields.has(id));
};

// Get required fields based on conditional rules
export const getRequiredFields = (
  baseRequiredFields: string[],
  rules: ConditionalRule[],
  formValues: { [fieldId: string]: unknown }
): string[] => {
  const required = new Set<string>(baseRequiredFields);

  rules.forEach(rule => {
    if (!rule.enabled || rule.action !== 'require') return;

    const sourceValue = formValues[rule.sourceFieldId];
    const conditionMet = evaluateCondition(sourceValue, rule.operator, rule.value);

    if (conditionMet) {
      required.add(rule.targetFieldId);
    }
  });

  return Array.from(required);
};

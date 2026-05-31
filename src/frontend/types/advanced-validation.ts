/**
 * Advanced Validation Type Definitions
 * Supports regex patterns, cross-field validation, and custom rules
 */

export type ValidationType = 
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'regex'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'minDate'
  | 'maxDate'
  | 'fileSize'
  | 'fileType'
  | 'crossField';

export interface AdvancedValidationRule {
  id: string;
  type: ValidationType;
  value?: string | number;
  pattern?: string; // For regex validation
  errorMessage: string;
  enabled: boolean;
  
  // Cross-field validation
  compareFieldId?: string;
  compareOperator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
  
  // File validation
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[]; // MIME types
  maxFiles?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common regex patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{13,19}$/,
  ssn: /^\d{3}-\d{2}-\d{4}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z]+$/,
  numeric: /^\d+$/,
};

// Validate a single field value
export const validateField = (
  value: unknown,
  rules: AdvancedValidationRule[],
  allFieldValues?: { [fieldId: string]: unknown }
): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const stringValue = String(value || '');
    const numericValue = Number(value);

    switch (rule.type) {
      case 'required':
        if (!value || stringValue.trim() === '') {
          errors.push(rule.errorMessage || 'This field is required');
        }
        break;

      case 'email':
        if (value && !VALIDATION_PATTERNS.email.test(stringValue)) {
          errors.push(rule.errorMessage || 'Please enter a valid email address');
        }
        break;

      case 'phone':
        if (value && !VALIDATION_PATTERNS.phone.test(stringValue)) {
          errors.push(rule.errorMessage || 'Please enter a valid phone number');
        }
        break;

      case 'url':
        if (value && !VALIDATION_PATTERNS.url.test(stringValue)) {
          errors.push(rule.errorMessage || 'Please enter a valid URL');
        }
        break;

      case 'regex':
        if (value && rule.pattern) {
          try {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(stringValue)) {
              errors.push(rule.errorMessage || 'Invalid format');
            }
          } catch {
            console.error('Invalid regex pattern:', rule.pattern);
          }
        }
        break;

      case 'minLength':
        if (value && stringValue.length < Number(rule.value || 0)) {
          errors.push(rule.errorMessage || `Minimum length is ${rule.value} characters`);
        }
        break;

      case 'maxLength':
        if (value && stringValue.length > Number(rule.value || 0)) {
          errors.push(rule.errorMessage || `Maximum length is ${rule.value} characters`);
        }
        break;

      case 'min':
        if (value && numericValue < Number(rule.value || 0)) {
          errors.push(rule.errorMessage || `Minimum value is ${rule.value}`);
        }
        break;

      case 'max':
        if (value && numericValue > Number(rule.value || 0)) {
          errors.push(rule.errorMessage || `Maximum value is ${rule.value}`);
        }
        break;

      case 'minDate':
        if (value && rule.value) {
          const inputDate = new Date(stringValue);
          const minDate = new Date(String(rule.value));
          if (inputDate < minDate) {
            errors.push(rule.errorMessage || `Date must be after ${rule.value}`);
          }
        }
        break;

      case 'maxDate':
        if (value && rule.value) {
          const inputDate = new Date(stringValue);
          const maxDate = new Date(String(rule.value));
          if (inputDate > maxDate) {
            errors.push(rule.errorMessage || `Date must be before ${rule.value}`);
          }
        }
        break;

      case 'fileSize':
        if (value && rule.maxFileSize) {
          const file = value as File;
          if (file.size && file.size > rule.maxFileSize) {
            const maxSizeMB = (rule.maxFileSize / (1024 * 1024)).toFixed(2);
            errors.push(rule.errorMessage || `File size must be less than ${maxSizeMB}MB`);
          }
        }
        break;

      case 'fileType':
        if (value && rule.allowedFileTypes && rule.allowedFileTypes.length > 0) {
          const file = value as File;
          if (file.type && !rule.allowedFileTypes.includes(file.type)) {
            errors.push(rule.errorMessage || `File type not allowed. Allowed types: ${rule.allowedFileTypes.join(', ')}`);
          }
        }
        break;

      case 'crossField':
        if (allFieldValues && rule.compareFieldId && rule.compareOperator) {
          const compareValue = allFieldValues[rule.compareFieldId];
          const currentValue = numericValue;
          const otherValue = Number(compareValue);

          let isValid = true;
          switch (rule.compareOperator) {
            case 'equals':
              isValid = currentValue === otherValue;
              break;
            case 'not_equals':
              isValid = currentValue !== otherValue;
              break;
            case 'greater_than':
              isValid = currentValue > otherValue;
              break;
            case 'less_than':
              isValid = currentValue < otherValue;
              break;
            case 'greater_than_or_equal':
              isValid = currentValue >= otherValue;
              break;
            case 'less_than_or_equal':
              isValid = currentValue <= otherValue;
              break;
          }

          if (!isValid) {
            errors.push(rule.errorMessage || 'Field validation failed');
          }
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate all fields in a form
export const validateForm = (
  fieldValues: { [fieldId: string]: unknown },
  fieldValidations: { [fieldId: string]: AdvancedValidationRule[] }
): { [fieldId: string]: ValidationResult } => {
  const results: { [fieldId: string]: ValidationResult } = {};

  Object.entries(fieldValidations).forEach(([fieldId, rules]) => {
    const value = fieldValues[fieldId];
    results[fieldId] = validateField(value, rules, fieldValues);
  });

  return results;
};

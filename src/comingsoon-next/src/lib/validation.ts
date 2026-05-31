/**
 * Unified validation utilities for forms across the Coming Soon UI
 */

import { isDisposableEmail } from './disposable-domains';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  value: string;
  touched: boolean;
  error?: string;
}

/**
 * Email validation with syntax check and disposable domain detection.
 * MX record verification is handled server-side in the API routes.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmedEmail = email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for disposable/temporary email domains (instant, client-side)
  if (isDisposableEmail(trimmedEmail)) {
    return { isValid: false, error: 'Please use a permanent email address (temporary emails are not accepted)' };
  }

  return { isValid: true };
}

/**
 * Full name validation
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(name)) {
    return { isValid: false, error: 'Name must contain at least one letter' };
  }
  
  return { isValid: true };
}

/**
 * Phone number validation (optional field, but validates format if provided)
 */
export function validatePhone(phone: string, required: boolean = false): ValidationResult {
  if (!phone || !phone.trim()) {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true }; // Optional and empty is OK
  }
  
  // Remove spaces, dashes, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Must start with + or be digits only
  if (!/^\+?[\d]{7,15}$/.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g., +1 234 567 8900)' };
  }
  
  return { isValid: true };
}

/**
 * Company name validation
 */
export function validateCompanyName(company: string, required: boolean = true): ValidationResult {
  if (!company || !company.trim()) {
    if (required) {
      return { isValid: false, error: 'Company name is required' };
    }
    return { isValid: true };
  }
  
  if (company.trim().length < 2) {
    return { isValid: false, error: 'Company name must be at least 2 characters' };
  }
  
  if (company.trim().length > 100) {
    return { isValid: false, error: 'Company name must be less than 100 characters' };
  }
  
  return { isValid: true };
}

/**
 * Message/textarea validation
 */
export function validateMessage(message: string, minLength: number = 10, required: boolean = true): ValidationResult {
  if (!message || !message.trim()) {
    if (required) {
      return { isValid: false, error: 'Message is required' };
    }
    return { isValid: true };
  }
  
  if (message.trim().length < minLength) {
    return { isValid: false, error: `Message must be at least ${minLength} characters` };
  }
  
  if (message.trim().length > 2000) {
    return { isValid: false, error: 'Message must be less than 2000 characters' };
  }
  
  return { isValid: true };
}

/**
 * Generic required field validation
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * Validate all fields in a form
 */
export function validateForm(validations: ValidationResult[]): { isValid: boolean; errors: string[] } {
  const errors = validations
    .filter(v => !v.isValid && v.error)
    .map(v => v.error as string);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

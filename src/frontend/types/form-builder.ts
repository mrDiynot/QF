/**
 * Form Builder Type Definitions
 * Multi-tenant aware form building types
 */

import type { ConditionalRule, CalculationFormula } from './conditional-logic';

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'file';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'phone';
  value?: string | number;
  message?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  advancedValidation?: import('./advanced-validation').AdvancedValidationRule[];
  options?: string[]; // For dropdown, radio, checkbox
  order: number;
  helpText?: string;
  defaultValue?: string;
}

export interface FormStyling {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  layout: 'single-column' | 'two-column';
  borderRadius: number;
  buttonText: string;
}

export interface FormSettings {
  submitButtonText: string;
  redirectUrl?: string;
  emailNotifications: boolean;
  notificationEmail?: string;
  autoResponse: boolean;
  autoResponseMessage?: string;
}

export interface ThankYouPage {
  message: string;
  showSubmissionSummary: boolean;
  redirectAfterSeconds?: number;
  redirectUrl?: string;
}

export interface FormBuilderState {
  id?: string;
  businessId?: string; // Multi-tenant identifier
  name: string;
  description?: string;
  fields: FormField[];
  styling: FormStyling;
  settings: FormSettings;
  thankYouPage: ThankYouPage;
  status: 'draft' | 'published' | 'archived';
  slug?: string;
  conditionalRules?: ConditionalRule[];
  calculations?: CalculationFormula[];
  multiPageSettings?: import('./multi-page-forms').MultiPageSettings;
}

export const DEFAULT_STYLING: FormStyling = {
  primaryColor: '#FF6B35',
  backgroundColor: '#FFFFFF',
  fontFamily: 'Inter',
  buttonStyle: 'rounded',
  layout: 'single-column',
  borderRadius: 8,
  buttonText: 'Submit',
};

export const DEFAULT_SETTINGS: FormSettings = {
  submitButtonText: 'Submit',
  emailNotifications: false,
  autoResponse: false,
};

export const DEFAULT_THANK_YOU: ThankYouPage = {
  message: 'Thank you for your submission! We\'ll be in touch soon.',
  showSubmissionSummary: true,
};

export const FIELD_TEMPLATES: Record<FieldType, Omit<FormField, 'id' | 'order'>> = {
  text: {
    type: 'text',
    label: 'Text Field',
    placeholder: 'Enter text...',
    required: false,
    validation: [],
  },
  email: {
    type: 'email',
    label: 'Email Address',
    placeholder: 'your@email.com',
    required: true,
    validation: [{ type: 'email', message: 'Please enter a valid email address' }],
  },
  phone: {
    type: 'phone',
    label: 'Phone Number',
    placeholder: '(555) 123-4567',
    required: false,
    validation: [{ type: 'phone', message: 'Please enter a valid phone number' }],
  },
  number: {
    type: 'number',
    label: 'Number',
    placeholder: '0',
    required: false,
    validation: [],
  },
  select: {
    type: 'select',
    label: 'Dropdown',
    placeholder: 'Select an option...',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
  radio: {
    type: 'radio',
    label: 'Radio Buttons',
    required: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
  textarea: {
    type: 'textarea',
    label: 'Text Area',
    placeholder: 'Enter detailed information...',
    required: false,
    validation: [],
  },
  date: {
    type: 'date',
    label: 'Date',
    placeholder: 'Select a date',
    required: false,
    validation: [],
  },
  file: {
    type: 'file',
    label: 'File Upload',
    required: false,
    helpText: 'Max file size: 10MB',
  },
};

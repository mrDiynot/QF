/**
 * AI Form Generation Types
 * Types for AI-powered form generation feature
 */

/**
 * BANT qualification categories for form fields
 */
export type BANTCategory = 'Budget' | 'Authority' | 'Need' | 'Timeline' | null;

/**
 * Request to generate a form using AI
 */
export interface GenerateFormRequest {
  /** The purpose/description of the form to generate */
  purpose: string;
  /** Industry context for better field suggestions */
  industry?: string;
  /** Specific fields the user wants included */
  desiredFields?: string[];
  /** Tone of the form (Professional, Friendly, Casual) */
  tone?: 'Professional' | 'Friendly' | 'Casual';
  /** Whether to include BANT qualification fields */
  includeBantFields?: boolean;
  /** Maximum number of fields to generate */
  maxFields?: number;
}

/**
 * AI-generated form field
 */
export interface GeneratedFormField {
  /** Field name/identifier */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  /** Placeholder text */
  placeholder?: string;
  /** Help text for the field */
  helpText?: string;
  /** Whether the field is required */
  required: boolean;
  /** Options for select, radio, checkbox fields */
  options?: string[];
  /** Validation rules */
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  /** BANT category mapping for lead qualification */
  bantMapping?: BANTCategory;
}

/**
 * AI-generated form data
 */
export interface GeneratedFormData {
  /** Suggested form name */
  name: string;
  /** Form description */
  description?: string;
  /** Generated form fields */
  fields: GeneratedFormField[];
  /** Submit button text */
  submitButtonText?: string;
  /** Success/thank you message */
  successMessage?: string;
  /** Suggested styling */
  styling?: {
    primaryColor?: string;
    layout?: 'single-column' | 'two-column';
  };
}

/**
 * Response from the AI form generation endpoint
 */
export interface GenerateFormResponse {
  /** Whether the generation was successful */
  success: boolean;
  /** Error message if generation failed */
  errorMessage?: string;
  /** Whether failure was due to usage limits */
  limitExceeded?: boolean;
  /** The generated form data */
  form?: GeneratedFormData;
  /** Audit ID for feedback tracking */
  auditId?: string;
  /** Number of tokens used */
  tokensUsed?: number;
  /** Estimated cost in USD */
  estimatedCostUsd?: number;
  /** Generation duration in milliseconds */
  durationMs?: number;
}

/**
 * State for the AI form generation wizard
 */
export interface AIFormGenerationState {
  /** Current step in the wizard (1-3) */
  step: 1 | 2 | 3;
  /** Form purpose/description */
  purpose: string;
  /** Selected industry */
  industry: string;
  /** Whether to include BANT fields */
  includeBantFields: boolean;
  /** Desired tone */
  tone: 'Professional' | 'Friendly' | 'Casual';
  /** Maximum fields */
  maxFields: number;
  /** Generated form result */
  generatedForm: GeneratedFormData | null;
  /** Generation audit ID */
  auditId: string | null;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Industry options for form generation
 */
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Professional Services',
  'Marketing & Advertising',
  'Hospitality',
  'Automotive',
  'Construction',
  'Legal',
  'Insurance',
  'Non-profit',
  'Other',
] as const;

export type Industry = (typeof INDUSTRY_OPTIONS)[number];

/**
 * Tone options for form generation
 */
export const TONE_OPTIONS = [
  { value: 'Professional', label: 'Professional', description: 'Formal, business-appropriate language' },
  { value: 'Friendly', label: 'Friendly', description: 'Warm, approachable but still professional' },
  { value: 'Casual', label: 'Casual', description: 'Relaxed, conversational tone' },
] as const;


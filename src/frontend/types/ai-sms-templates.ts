/**
 * AI SMS Template Generation Types
 * Types for AI-powered SMS template generation feature
 */

/**
 * Request to generate SMS templates using AI
 */
export interface GenerateSmsTemplateRequest {
  /** The purpose/use case for the templates (e.g., "appointment reminders") */
  purpose: string;
  /** Industry context for tailored messaging */
  industry?: string;
  /** Desired tone (Professional, Friendly, Casual) */
  tone?: 'Professional' | 'Friendly' | 'Casual';
  /** Category for the generated templates */
  category?: string;
  /** Number of template variations to generate (1-5) */
  variationCount?: number;
  /** Optional context about the business or product */
  businessContext?: string;
  /** Optional example templates to use as reference */
  exampleTemplates?: string[];
  /** Whether to include variable placeholders like {{name}}, {{date}} */
  includeVariables?: boolean;
}

/**
 * AI-generated SMS template
 */
export interface GeneratedSmsTemplate {
  /** Template name */
  name: string;
  /** SMS message content */
  content: string;
  /** Template category */
  category: string;
  /** Character count of the message */
  characterCount: number;
  /** Number of SMS segments required */
  segmentCount: number;
  /** List of variables used in the template */
  variables: string[];
}

/**
 * Response from the AI SMS template generation endpoint
 */
export interface GenerateSmsTemplateResponse {
  /** Whether the generation was successful */
  success: boolean;
  /** Error message if generation failed */
  errorMessage?: string;
  /** Whether failure was due to usage limits */
  limitExceeded?: boolean;
  /** The generated templates */
  templates: GeneratedSmsTemplate[];
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
 * State for the AI SMS template generation wizard
 */
export interface AISmsTemplateGenerationState {
  /** Current step in the wizard (1-3) */
  step: 1 | 2 | 3;
  /** Template purpose/use case */
  purpose: string;
  /** Selected industry */
  industry: string;
  /** Desired tone */
  tone: 'Professional' | 'Friendly' | 'Casual';
  /** Template category */
  category: string;
  /** Number of variations to generate */
  variationCount: number;
  /** Additional business context */
  businessContext: string;
  /** Whether to include variables */
  includeVariables: boolean;
  /** Generated templates result */
  generatedTemplates: GeneratedSmsTemplate[];
  /** Generation audit ID */
  auditId: string | null;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Error message */
  error: string | null;
}

/**
 * SMS template category options
 */
export const SMS_TEMPLATE_CATEGORIES = [
  'Reminders',
  'Confirmations',
  'Follow-ups',
  'Promotions',
  'Notifications',
  'Welcome Messages',
  'Feedback Requests',
  'Abandoned Cart',
  'Order Updates',
  'General',
] as const;

export type SmsTemplateCategory = (typeof SMS_TEMPLATE_CATEGORIES)[number];

/**
 * Industry options (shared with forms)
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
 * Tone options for SMS generation
 */
export const TONE_OPTIONS = [
  { value: 'Professional', label: 'Professional', description: 'Formal, business-appropriate language' },
  { value: 'Friendly', label: 'Friendly', description: 'Warm, approachable but still professional' },
  { value: 'Casual', label: 'Casual', description: 'Relaxed, conversational tone' },
] as const;


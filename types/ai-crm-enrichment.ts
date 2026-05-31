/**
 * AI CRM Enrichment Types
 * TypeScript types for AI-powered CRM data extraction from conversations
 */

/** Request to enrich CRM data from a conversation */
export interface CrmEnrichmentRequest {
  /** The conversation ID to analyze */
  conversationId: string;
  /** Optional lead ID to enrich */
  leadId?: string;
  /** Optional contact ID to enrich */
  contactId?: string;
  /** Optional deal ID to enrich */
  dealId?: string;
  /** Whether to include company info extraction (default: true) */
  includeCompanyInfo?: boolean;
  /** Whether to include contact details extraction (default: true) */
  includeContactDetails?: boolean;
  /** Whether to include deal signals extraction (default: true) */
  includeDealSignals?: boolean;
  /** Whether to include BANT scoring (default: true) */
  includeBantScores?: boolean;
}

/** A suggested CRM field update extracted from conversation */
export interface CrmFieldSuggestion {
  /** The field name to update */
  fieldName: string;
  /** The suggested value */
  suggestedValue: string;
  /** Confidence score (0.0-1.0) */
  confidence: number;
  /** Quote from conversation supporting this suggestion */
  sourceQuote?: string;
  /** AI reasoning for this extraction */
  reasoning?: string;
}

/** BANT scores extracted from conversation */
export interface BantScores {
  /** Budget score (0-100) */
  budgetScore: number;
  /** Signals supporting budget assessment */
  budgetSignals: string[];
  /** Authority score (0-100) */
  authorityScore: number;
  /** Signals supporting authority assessment */
  authoritySignals: string[];
  /** Need score (0-100) */
  needScore: number;
  /** Signals supporting need assessment */
  needSignals: string[];
  /** Timeline score (0-100) */
  timelineScore: number;
  /** Signals supporting timeline assessment */
  timelineSignals: string[];
  /** Overall confidence (0.0-1.0) */
  confidence: number;
}

/** Result of CRM enrichment analysis */
export interface CrmEnrichmentResult {
  /** Whether the enrichment was successful */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
  /** Whether failure was due to usage limits */
  limitExceeded: boolean;
  /** The conversation ID analyzed */
  conversationId: string;
  /** Suggested contact field updates */
  contactSuggestions: CrmFieldSuggestion[];
  /** Suggested company field updates */
  companySuggestions: CrmFieldSuggestion[];
  /** Suggested deal field updates */
  dealSuggestions: CrmFieldSuggestion[];
  /** BANT scores extracted from conversation */
  bantScores?: BantScores;
  /** Audit ID for feedback tracking */
  auditId?: string;
  /** Tokens used for this enrichment */
  tokensUsed: number;
}

/** Request to apply accepted enrichment suggestions */
export interface ApplyEnrichmentRequest {
  /** Lead ID to update */
  leadId?: string;
  /** Contact ID to update */
  contactId?: string;
  /** Deal ID to update */
  dealId?: string;
  /** The accepted suggestions to apply */
  acceptedSuggestions: CrmFieldSuggestion[];
}

/** Response after applying enrichment */
export interface ApplyEnrichmentResponse {
  /** Whether the application was successful */
  success: boolean;
  /** Message describing the result */
  message?: string;
}

/** Suggestion category for UI grouping */
export type SuggestionCategory = 'contact' | 'company' | 'deal';

/** Helper type for tracking accepted/rejected suggestions in UI */
export interface SuggestionWithStatus extends CrmFieldSuggestion {
  /** Unique ID for tracking */
  id: string;
  /** The category this suggestion belongs to */
  category: SuggestionCategory;
  /** Whether this suggestion is accepted */
  accepted: boolean;
}

/** Field display configuration */
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  name: 'Full Name',
  fullName: 'Full Name',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email Address',
  phone: 'Phone Number',
  jobTitle: 'Job Title',
  department: 'Department',
  companyName: 'Company Name',
  industry: 'Industry',
  companySize: 'Company Size',
  location: 'Location',
  website: 'Website',
  budgetRange: 'Budget Range',
  timeline: 'Timeline',
  painPoints: 'Pain Points',
  competitors: 'Competitors Mentioned',
  decisionCriteria: 'Decision Criteria',
};

/** Get display name for a field */
export function getFieldDisplayName(fieldName: string): string {
  return FIELD_DISPLAY_NAMES[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
}


/**
 * AI Onboarding Recommendation Types
 * Types for AI-powered onboarding recommendations feature
 */

/**
 * Request for AI onboarding recommendations
 */
export interface OnboardingRecommendationRequest {
  /** Industry/business type */
  industry: string;
  /** Company size */
  companySize?: string;
  /** Business goals (multi-select) */
  goals?: string[];
  /** Lead type (B2B, B2C, Both) */
  leadType?: string;
  /** Main objective */
  mainObjective?: string;
  /** Current lead sources */
  leadSources?: string[];
  /** Target audience description */
  targetAudience?: string;
}

/**
 * Channel recommendation with priority and rationale
 */
export interface ChannelRecommendation {
  /** Channel type (sms, voice, whatsapp, webchat, email, instagram, facebook) */
  channelType: string;
  /** Priority score (1-100) */
  priority: number;
  /** Explanation for this recommendation */
  rationale: string;
  /** Whether this is highly recommended for the industry */
  isHighlyRecommended: boolean;
  /** Expected impact description */
  expectedImpact?: string;
}

/**
 * Workflow recommendation with trigger and category
 */
export interface WorkflowRecommendation {
  /** Workflow name */
  name: string;
  /** Workflow description */
  description: string;
  /** Trigger type */
  triggerType: string;
  /** Workflow category */
  category: string;
  /** Priority score (1-100) */
  priority: number;
  /** Explanation for this recommendation */
  rationale: string;
}

/**
 * Form recommendation with BANT fields
 */
export interface FormRecommendation {
  /** Form name */
  name: string;
  /** Form purpose */
  purpose: string;
  /** Recommended form fields */
  recommendedFields: string[];
  /** BANT qualification fields */
  bantFields: string[];
  /** Priority score (1-100) */
  priority: number;
  /** Explanation for this recommendation */
  rationale: string;
}

/**
 * AI configuration recommendation
 */
export interface AIConfigRecommendation {
  /** Recommended conversation tone */
  recommendedTone: 'professional' | 'friendly' | 'casual' | 'formal';
  /** Qualification threshold (0-100) */
  qualificationThreshold: number;
  /** BANT scoring weights */
  scoringWeights: BantWeights;
  /** Suggested greeting message */
  greetingMessage?: string;
  /** Follow-up preference */
  followUpPreference?: 'sms-first' | 'email-first' | 'call-first';
  /** Explanation for these settings */
  rationale?: string;
}

/**
 * BANT scoring weights
 */
export interface BantWeights {
  /** Budget weight (0-100) */
  budget: number;
  /** Authority weight (0-100) */
  authority: number;
  /** Need weight (0-100) */
  need: number;
  /** Timeline weight (0-100) */
  timeline: number;
}

/**
 * Automation recommendation
 */
export interface AutomationRecommendation {
  /** Automation name */
  name: string;
  /** Automation description */
  description: string;
  /** Category (lead_capture, lead_qualification, follow_up, nurturing, conversion) */
  category: string;
  /** Priority score (1-100) */
  priority: number;
  /** Explanation for this recommendation */
  rationale: string;
  /** Whether this is a quick win (easy to implement, high impact) */
  isQuickWin: boolean;
}

/**
 * Full recommendation result from AI
 */
export interface OnboardingRecommendationResult {
  /** Whether the request was successful */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
  /** Recommended communication channels */
  recommendedChannels: ChannelRecommendation[];
  /** Recommended workflow templates */
  recommendedWorkflows: WorkflowRecommendation[];
  /** Recommended form configurations */
  recommendedForms: FormRecommendation[];
  /** AI configuration recommendations */
  aiConfiguration?: AIConfigRecommendation;
  /** Recommended automations */
  recommendedAutomations: AutomationRecommendation[];
  /** Generation time in milliseconds */
  generationTimeMs?: number;
}


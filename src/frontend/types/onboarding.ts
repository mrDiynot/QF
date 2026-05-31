/**
 * Onboarding types
 */

export interface OnboardingStatus {
  businessId: string;
  businessName?: string;
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  isSkipped: boolean;
  startedAt: string;
  completedAt?: string;
  skippedAt?: string;
  progressPercentage: number;
  /** Whether the business has onboarding support (purchased or included in plan) */
  hasOnboardingSupport?: boolean;
  /** Whether the onboarding call has been scheduled */
  onboardingCallScheduled?: boolean;
  /** When the onboarding call was scheduled */
  onboardingCallScheduledAt?: string;
}

/**
 * Business profile data for Steps 1-5 checkpoint.
 * Maps to UpdateBusinessProfileRequest in backend.
 */
export interface BusinessProfileData {
  businessName: string;
  industry: string;
  companySize: string;
  timezone: string;
  crmPlatform?: string;
  leadType?: string;
  mainObjective?: string;
}

export type ChannelType = 'sms' | 'voice' | 'whatsapp' | 'instagram' | 'facebook' | 'chat_widget';

/**
 * Channel setup data for Steps 6-7 checkpoint.
 * Maps to SelectChannelsRequest in backend.
 */
export interface ChannelSetupData {
  selectedChannels: string[];
  selectedAutomations: string[];
}

export interface ScoringCriteria {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
}

/**
 * AI configuration data for Steps 8-10 checkpoint.
 * Maps to ConfigureAIRequest in backend.
 */
export interface AIConfigurationData {
  persona: string;
  qualificationThreshold?: number;
  scoringWeights?: ScoringCriteria;
  greetingMessage?: string;
  phoneSetup?: {
    type: string;
    existingNumber?: string;
    newNumber?: string;
  };
  callHandling?: {
    forwardNumber?: string;
    sendSmsOnMissed: boolean;
    enableOutboundAi: boolean;
  };
  businessHours?: string;
  followUpPreference?: string;
}

export const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Real Estate', 'Professional Services', 'Marketing & Advertising', 'E-commerce', 'Hospitality', 'Other'] as const;

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const;

// New types for complete onboarding flow (aligned with Figma design)

// Step 1: Business Type (9 categories per Figma)
export type BusinessType =
  | 'real_estate'
  | 'home_services'
  | 'legal'
  | 'healthcare'
  | 'coaching'
  | 'finance'
  | 'agency'
  | 'saas'
  | 'other';

// Legacy alias for backward compatibility
export type Industry = BusinessType;

// Step 2: Goals (7 options, multi-selectable per Figma)
export type Goal =
  | 'qualify_leads'      // Qualify leads faster
  | 'automate_followups' // Automate follow-ups
  | 'capture_channels'   // Capture leads from multiple channels
  | 'book_meetings'      // Book more meetings
  | 'reduce_noshows'     // Reduce no-shows (Ultra Flow)
  | 'proposals'          // Send proposals (Ultra Flow)
  | 'crm_sync';          // Sync with my CRM

// Legacy alias for backward compatibility
export type Objective = 'sales' | 'automation' | 'communication' | 'meetings' | 'proposals' | 'organize';

// Step 3: Lead Capture Channels (where leads come from)
export type LeadCaptureSource =
  | 'website'         // Website / Landing Pages
  | 'social_media'    // Social Media (Instagram, Facebook)
  | 'google_ads'      // Google Ads / PPC
  | 'referrals'       // Referrals / Word of Mouth
  | 'cold_outreach'   // Cold Outreach
  | 'events';         // Events / Trade Shows

// Step 4: Channels to use (communication channels)
export type Channel = 'sms' | 'phone' | 'whatsapp' | 'email' | 'web_chat' | 'web_forms' | 'social';

// Step 5: Lead Types
export type LeadType = 'b2b' | 'b2c' | 'both';

// Step 6: CRM Platform (12 options per Figma)
export type CRMPlatform =
  | 'builtin'         // QualiFlow AI Built-In (Recommended)
  | 'hubspot'
  | 'gohighlevel'
  | 'salesforce'
  | 'zoho'
  | 'pipedrive'
  | 'monday'
  | 'freshsales'
  | 'activecampaign'
  | 'close'
  | 'copper'
  | 'other';

// Step 7: Team Size (5 options per Figma)
export type TeamSize = 'just_me' | '2-5' | '6-10' | '11-50' | '50+';

// Step 8: Phone Setup (3 options per Figma)
export type PhoneSetupType = 'existing' | 'qualiflow_number' | 'qualiflow_twilio' | 'skip';

// Step 9: Business Hours (display/edit)
export interface BusinessHoursConfig {
  timezone: string;
  schedule: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
}

// Step 10: Calendar Integration
export type CalendarProvider = 'google' | 'outlook' | 'qualiflow' | 'skip';

// Step 11: Onboarding Support
export interface OnboardingSupportSelection {
  wantsSupport: boolean;
  selectedPackage?: 'basic'; // $700 package
}

// All 10 pre-built journeys from database (prebuilt_journeys table)
export type Automation =
  | 'lead_qualification'      // New Lead Qualification → Booking
  | 'missed_call'             // Missed Call Recovery
  | 'no_show_recovery'        // No-Show Recovery
  | 'review_survey'           // Review + Survey Flow
  | 'cold_lead_revival'       // Cold Lead Revival
  | 'retention_reengagement'  // Retention & Re-Engagement
  | 'proposal_creation'       // Proposal Creation + Assignment
  | 'proposal_sending'        // Proposal Sending + Acceptance
  | 'abandoned_form'          // Abandoned Form Recovery
  | 'post_purchase';          // Post-Purchase Flow

export type AITone = 'professional' | 'friendly' | 'casual' | 'enthusiastic';

/**
 * OnboardingFormData - Matches Figma 11-step design
 * Step order: Business Type → Goals → Lead Sources → Channels → Lead Types →
 *             CRM → Team Size → Phone → Business Hours → Calendar → Onboarding Support
 */
export interface OnboardingFormData {
  // Step 1: Business Type (9 categories)
  businessType: BusinessType | '';
  /** @deprecated Use businessType instead. Kept for backward compatibility */
  industry?: Industry | '';

  // Step 2: Goals (MULTI-SELECT - 7 options with Ultra Flow badges)
  goals: Goal[];
  /** @deprecated Use goals instead. Single objective kept for backward compatibility */
  objective?: Objective | '';

  // Step 3: Lead Capture Sources (where leads come from)
  leadCaptureSources: LeadCaptureSource[];

  // Step 4: Channels to use (communication channels)
  channels: Channel[];

  // Step 5: Lead Types (B2B, B2C, or Both)
  leadType: LeadType | '';

  // Step 6: CRM Platform (12 options)
  crm: CRMPlatform | '';

  // Step 7: Team Size (5 options)
  teamSize: TeamSize | '';

  // Step 8: Phone Setup (3 options)
  phoneSetup: {
    type: PhoneSetupType | '';
  };

  // Step 9: Business Hours
  businessHours: BusinessHoursConfig | null;

  // Step 10: Calendar Integration
  calendarProvider: CalendarProvider | '';

  // Step 11: Onboarding Support ($700 upsell)
  onboardingSupport: OnboardingSupportSelection;

  // Legacy fields for backward compatibility (can be removed after migration)
  automations?: Automation[];
  callHandling?: {
    forwardNumber?: string;
    sendSMSOnMissed: boolean;
    enableOutboundAI: boolean;
  };
  finalTouches?: {
    aiTone: AITone | '';
    businessHours?: string;
    followUpPreference?: string;
    enableAutoResponse?: boolean;
  };
}
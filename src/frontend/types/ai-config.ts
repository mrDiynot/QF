/**
 * AI Configuration Types
 * Matches backend DTOs from Qualiflow AIAI.Application.Features.Onboarding.DTOs
 */

export interface ScoringWeights {
  budget: number;
  timeline: number;
  authority: number;
  need: number;
}

export interface PhoneSetup {
  type: 'existing' | 'new' | 'skip';
  existingNumber?: string;
  newNumber?: string;
}

export interface CallHandling {
  forwardNumber?: string;
  sendSmsOnMissed: boolean;
  enableOutboundAi: boolean;
}

export interface AIConfiguration {
  persona: 'professional' | 'friendly' | 'casual' | 'formal';
  qualificationThreshold: number;
  scoringWeights: ScoringWeights;
  greetingMessage: string;
  phoneSetup?: PhoneSetup;
  callHandling?: CallHandling;
  businessHours?: string;
  followUpPreference?: string;
}

export interface UpdateAIConfigurationRequest {
  persona?: 'professional' | 'friendly' | 'casual' | 'formal';
  qualificationThreshold?: number;
  scoringWeights?: ScoringWeights;
  greetingMessage?: string;
  phoneSetup?: PhoneSetup;
  callHandling?: CallHandling;
  businessHours?: string;
  followUpPreference?: string;
}


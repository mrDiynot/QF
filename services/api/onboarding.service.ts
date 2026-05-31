/**
 * Onboarding API Service
 * Handles all onboarding wizard-related API calls
 */

import { apiClient } from '@/lib/axios';
import type {
  OnboardingStatus,
  BusinessProfileRequest,
  ChannelSelectionRequest,
  AiConfigurationRequest,
} from '@/types/api';

export const onboardingService = {
  /**
   * Get onboarding status
   * GET /api/v1/onboarding/status
   */
  getStatus: async (): Promise<OnboardingStatus> => {
    const response = await apiClient.get<OnboardingStatus>('/onboarding/status');
    return response.data;
  },

  /**
   * Submit business profile (Step 1)
   * POST /api/v1/onboarding/business-profile
   */
  submitBusinessProfile: async (data: BusinessProfileRequest): Promise<void> => {
    await apiClient.post('/onboarding/business-profile', data);
  },

  /**
   * Submit channel selection (Step 2)
   * POST /api/v1/onboarding/channels
   */
  submitChannels: async (data: ChannelSelectionRequest): Promise<void> => {
    await apiClient.post('/onboarding/channels', data);
  },

  /**
   * Submit AI configuration (Step 3)
   * POST /api/v1/onboarding/ai-configuration
   */
  submitAiConfiguration: async (data: AiConfigurationRequest): Promise<void> => {
    await apiClient.post('/onboarding/ai-configuration', data);
  },

  /**
   * Submit CRM configuration (Step 4)
   * POST /api/v1/onboarding/crm-configuration
   */
  submitCrmConfiguration: async (data: { crmType: string }): Promise<void> => {
    await apiClient.post('/onboarding/crm-configuration', data);
  },

  /**
   * Complete onboarding
   * POST /api/v1/onboarding/complete
   */
  complete: async (): Promise<void> => {
    await apiClient.post('/onboarding/complete');
  },

  /**
   * Complete onboarding with free tier plan (7-day trial)
   * Used when payment is cancelled or user chooses free plan
   * POST /api/v1/onboarding/complete-with-free-tier
   */
  completeWithFreeTier: async (): Promise<void> => {
    await apiClient.post('/onboarding/complete-with-free-tier');
  },

  /**
   * Get industry defaults
   * GET /api/v1/onboarding/industry-defaults
   */
  getIndustryDefaults: async (industry: string): Promise<unknown> => {
    const response = await apiClient.get('/onboarding/industry-defaults', {
      params: { industry }
    });
    return response.data;
  },

  /**
   * Get onboarding preferences for settings display
   * GET /api/v1/onboarding/preferences
   */
  getPreferences: async (): Promise<OnboardingPreferences> => {
    const response = await apiClient.get<OnboardingPreferences>('/onboarding/preferences');
    return response.data;
  },

  /**
   * Get onboarding progress
   * GET /api/v1/onboarding/progress
   */
  getProgress: async (): Promise<OnboardingPreferences> => {
    const response = await apiClient.get<OnboardingPreferences>('/onboarding/progress');
    return response.data;
  },

  /**
   * Update business profile (can be called after onboarding to update settings)
   * POST /api/v1/onboarding/business-profile
   */
  updateBusinessProfile: async (data: UpdateBusinessProfileRequest): Promise<void> => {
    await apiClient.post('/onboarding/business-profile', data);
  },
};

export interface OnboardingPreferences {
  businessId: string;
  industry?: string;
  teamSize?: string;
  crmProvider?: string;
  leadType?: string;
  mainObjective?: string;
  selectedChannels: string[];
  selectedAutomations: string[];
  phoneNumberOption?: string;
  existingPhoneNumber?: string;
  aiPhoneNumber?: string;
  callForwardTo?: string;
  missedCallSmsEnabled: boolean;
  outboundAiCallingEnabled: boolean;
  aiTone?: string;
  businessHours?: string;
  followUpPreference?: string;
  completedAt?: string;
  isComplete: boolean;
}

export interface UpdateBusinessProfileRequest {
  businessName: string;
  industry: string;
  companySize: string;
  timezone: string;
  website?: string;
  country?: string;
  crmPlatform?: string;
  leadType?: string;
  mainObjective?: string;
}
/**
 * Settings API Service
 * Handles all settings-related API calls
 */

import { apiClient } from '@/lib/axios';
import type {
  BusinessSettings,
  UpdateBusinessSettingsRequest,
  UserProfile,
  UpdateUserProfileRequest,
  TwilioSettings,
  TwilioUsageSummary
} from '@/types/api';

export const settingsService = {
  /**
   * Get business settings
   * GET /api/v1/business/settings
   */
  getBusinessSettings: async (): Promise<BusinessSettings> => {
    const response = await apiClient.get<BusinessSettings>('/business/settings');
    return response.data;
  },

  /**
   * Update business settings
   * PATCH /api/v1/business/settings
   */
  updateBusinessSettings: async (data: UpdateBusinessSettingsRequest): Promise<BusinessSettings> => {
    const response = await apiClient.patch<BusinessSettings>('/business/settings', data);
    return response.data;
  },

  /**
   * Get user profile
   * GET /api/v1/users/me
   */
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  },

  /**
   * Update user profile
   * PATCH /api/v1/users/me
   */
  updateUserProfile: async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/users/me', data);
    return response.data;
  },

  /**
   * Get Twilio settings for the current business
   * GET /api/v1/business/twilio/settings
   */
  getTwilioSettings: async (): Promise<TwilioSettings> => {
    const response = await apiClient.get<TwilioSettings>('/business/twilio/settings');
    return response.data;
  },

  /**
   * Get Twilio usage for the current business
   * GET /api/v1/business/twilio/usage
   */
  getTwilioUsage: async (): Promise<TwilioUsageSummary> => {
    const response = await apiClient.get<TwilioUsageSummary>('/business/twilio/usage');
    return response.data;
  },
};
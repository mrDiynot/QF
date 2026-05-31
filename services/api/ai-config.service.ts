/**
 * AI Configuration API Service
 * Handles AI configuration and system settings API calls
 */

import { apiClient } from '@/lib/axios';
import type { AIConfiguration, UpdateAIConfigurationRequest } from '@/types/ai-config';

export const aiConfigService = {
  /**
   * Get current AI configuration
   * GET /api/v1/onboarding/ai-configuration
   */
  getAIConfiguration: async (): Promise<AIConfiguration> => {
    const response = await apiClient.get<AIConfiguration>('/onboarding/ai-configuration');
    return response.data;
  },

  /**
   * Update AI configuration
   * POST /api/v1/onboarding/ai-configuration
   */
  updateAIConfiguration: async (data: UpdateAIConfigurationRequest): Promise<AIConfiguration> => {
    const response = await apiClient.post<AIConfiguration>('/onboarding/ai-configuration', data);
    return response.data;
  },

  /**
   * Get industry-specific AI defaults
   * GET /api/v1/onboarding/industry-defaults
   */
  getIndustryDefaults: async (): Promise<AIConfiguration> => {
    const response = await apiClient.get<AIConfiguration>('/onboarding/industry-defaults');
    return response.data;
  },
};


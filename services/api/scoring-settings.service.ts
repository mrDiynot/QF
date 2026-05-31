// -----------------------------------------------------------------------
// Scoring Settings API Service
// Manages business-configurable BANT and AI qualification scoring settings
// -----------------------------------------------------------------------

import { apiClient } from '@/lib/axios';

export interface ScoringConfiguration {
  id: string;
  qualificationThreshold: number;
  aiWeight: number;
  rulesWeight: number;
  budgetWeight: number;
  authorityWeight: number;
  needWeight: number;
  timelineWeight: number;
  contactedThreshold: number;
  engagedThreshold: number;
  qualifiedThreshold: number;
  opportunityThreshold: number;
  autoTransitionStatus: boolean;
  aiScoreEnabled: boolean;
  scoreDecayDays: number;
  scoreDecayPercentage: number;
  industryTemplate?: string;
  updatedAt?: string;
}

export interface UpdateScoringConfigurationRequest {
  qualificationThreshold: number;
  aiWeight: number;
  rulesWeight: number;
  budgetWeight: number;
  authorityWeight: number;
  needWeight: number;
  timelineWeight: number;
  contactedThreshold: number;
  engagedThreshold: number;
  qualifiedThreshold: number;
  opportunityThreshold: number;
  autoTransitionStatus: boolean;
  aiScoreEnabled: boolean;
  scoreDecayDays: number;
  scoreDecayPercentage: number;
}

const BASE_URL = '/api/v1/scoring-settings';

export const scoringSettingsService = {
  /**
   * Gets the current scoring configuration for the business
   */
  async getConfiguration(): Promise<ScoringConfiguration> {
    const response = await apiClient.get<ScoringConfiguration>(BASE_URL);
    return response.data;
  },

  /**
   * Updates the scoring configuration for the business
   */
  async updateConfiguration(
    request: UpdateScoringConfigurationRequest
  ): Promise<ScoringConfiguration> {
    const response = await apiClient.put<ScoringConfiguration>(BASE_URL, request);
    return response.data;
  },

  /**
   * Resets the scoring configuration to industry defaults
   */
  async resetToDefaults(): Promise<ScoringConfiguration> {
    const response = await apiClient.post<ScoringConfiguration>(`${BASE_URL}/reset`);
    return response.data;
  },
};

// Default configuration values
export const DEFAULT_SCORING_CONFIG: ScoringConfiguration = {
  id: '',
  qualificationThreshold: 70,
  aiWeight: 60,
  rulesWeight: 40,
  budgetWeight: 25,
  authorityWeight: 25,
  needWeight: 25,
  timelineWeight: 25,
  contactedThreshold: 20,
  engagedThreshold: 40,
  qualifiedThreshold: 70,
  opportunityThreshold: 85,
  autoTransitionStatus: true,
  aiScoreEnabled: true,
  scoreDecayDays: 14,
  scoreDecayPercentage: 10,
};

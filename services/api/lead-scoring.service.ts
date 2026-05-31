import { apiClient } from '@/lib/axios';

// Types
export interface ScoreHistoryEntry {
  id: string;
  leadId: string;
  score: number;
  previousScore: number | null;
  scoreChange: number;
  source: string;
  reason: string | null;
  scoredAt: string;
}

export interface BantExtractionResult {
  budgetScore: number;
  budgetSignals: string[];
  authorityScore: number;
  authoritySignals: string[];
  needScore: number;
  needSignals: string[];
  timelineScore: number;
  timelineSignals: string[];
  confidence: number;
  reasoning: string | null;
  supportingQuotes: string[] | null;
}

export interface ScoringFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  reasoning: string | null;
}

export interface LeadScoreResult {
  leadId: string;
  finalScore: number;
  previousScore: number;
  scoreChange: number;
  isQualified: boolean;
  recommendedStatus: string;
  factors: ScoringFactor[];
  trigger: string | null;
  scoredAt: string;
}

export interface ScoringConfiguration {
  qualificationThreshold: number;
  aiWeight: number;
  rulesWeight: number;
  bantWeights: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  thresholds: {
    contacted: number;
    engaged: number;
    qualified: number;
    opportunity: number;
  };
  autoTransitionStatus: boolean;
}

// API Functions
export const leadScoringService = {
  /**
   * Get score history for a lead
   */
  getScoreHistory: async (leadId: string, limit = 10): Promise<ScoreHistoryEntry[]> => {
    try {
      const response = await apiClient.get<ScoreHistoryEntry[]>(
        `/LeadScoring/${leadId}/history`,
        { params: { limit } }
      );
      return response.data || [];
    } catch (error) {
      console.error('[LeadScoring] Failed to get score history:', error);
      return [];
    }
  },

  /**
   * Recalculate score for a lead
   */
  recalculateScore: async (leadId: string): Promise<LeadScoreResult> => {
    const response = await apiClient.post<LeadScoreResult>(
      `/LeadScoring/${leadId}/recalculate`
    );
    return response.data;
  },

  /**
   * Extract BANT signals from a conversation
   */
  extractBant: async (conversationId: string): Promise<BantExtractionResult> => {
    const response = await apiClient.get<BantExtractionResult>(
      `/LeadScoring/bant/${conversationId}`
    );
    return response.data;
  },

  /**
   * Get current scoring configuration
   */
  getConfiguration: async (): Promise<ScoringConfiguration> => {
    try {
      const response = await apiClient.get<ScoringConfiguration>(
        '/LeadScoring/configuration'
      );
      return response.data;
    } catch (error) {
      console.error('[LeadScoring] Failed to get configuration:', error);
      // Return default configuration
      return {
        qualificationThreshold: 70,
        aiWeight: 0.6,
        rulesWeight: 0.4,
        bantWeights: { budget: 0.25, authority: 0.25, need: 0.25, timeline: 0.25 },
        thresholds: { contacted: 20, engaged: 40, qualified: 70, opportunity: 85 },
        autoTransitionStatus: true,
      };
    }
  },
};

export default leadScoringService;

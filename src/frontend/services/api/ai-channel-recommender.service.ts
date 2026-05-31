/**
 * AI Channel Recommender Service
 * Provides intelligent channel recommendations based on business profile and industry data
 */

import { apiClient } from '@/lib/axios';
import type { ChannelType } from '@/types/api';

export interface ChannelRecommendation {
  channelType: ChannelType;
  displayName: string;
  description: string;
  confidenceScore: number; // 0-100
  reasoning: string;
  expectedImpact: {
    conversionIncrease: string; // "+35%"
    revenueIncrease: string; // "+$3,200/month"
    timeToValue: string; // "3-5 days"
    leadVolumeIncrease: string; // "+40 leads/month"
  };
  setupDifficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMonthlyCost: number;
  priority: number; // 1 = highest
  useCases: string[];
  proTips: string[];
}

export interface ChannelBundle {
  industry: string;
  bundleName: string;
  recommendedChannels: ChannelType[];
  description: string;
  totalImpact: {
    conversionIncrease: string;
    revenueIncrease: string;
    timeToValue: string;
    leadVolumeIncrease: string;
  };
  totalMonthlyCost: number;
}

export interface ChannelImpactPrediction {
  channelType: ChannelType;
  predictedLeadsPerMonth: number;
  predictedConversionRate: number;
  predictedRevenuePerMonth: number;
  daysToFirstConversion: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export const aiChannelRecommenderService = {
  /**
   * Gets personalized channel recommendations for the current business
   */
  async getRecommendations(): Promise<ChannelRecommendation[]> {
    try {
      const response = await apiClient.get<ChannelRecommendation[]>('/api/v1/channels/ai/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to get channel recommendations:', error);
      // Return empty array on error - UI will handle gracefully
      return [];
    }
  },

  /**
   * Gets industry-specific channel bundle recommendations
   */
  async getIndustryBundle(industry: string): Promise<ChannelBundle | null> {
    try {
      const response = await apiClient.get<ChannelBundle>(`/api/v1/channels/ai/bundles/${encodeURIComponent(industry)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get industry bundle:', error);
      return null;
    }
  },

  /**
   * Predicts expected impact of adding a specific channel
   */
  async predictImpact(channelType: ChannelType): Promise<ChannelImpactPrediction | null> {
    try {
      const response = await apiClient.get<ChannelImpactPrediction>(`/api/v1/channels/ai/predict/${channelType}`);
      return response.data;
    } catch (error) {
      console.error('Failed to predict channel impact:', error);
      return null;
    }
  }
};

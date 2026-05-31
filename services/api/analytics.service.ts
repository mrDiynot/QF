/**
 * Analytics API Service
 * Handles all analytics-related API calls
 */

import { apiClient } from '@/lib/axios';
import type { DashboardMetrics, ConversionFunnel, ChannelPerformance, AIUsageSummary } from '@/types/api';

export const analyticsService = {
  /**
   * Get dashboard metrics
   * GET /api/v1/analytics/dashboard
   * Accepts date range parameters for filtering
   */
  getDashboardMetrics: async (startDate?: string, endDate?: string): Promise<DashboardMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    
    const response = await apiClient.get<DashboardMetrics>(
      `/analytics/dashboard${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get conversion funnel data
   * GET /api/v1/analytics/conversion-funnel
   */
  getConversionFunnel: async (): Promise<ConversionFunnel> => {
    // Use explicit date range for consistent data
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const params = new URLSearchParams();
    params.append('startDate', startDate.toISOString());
    params.append('endDate', endDate.toISOString());
    
    const response = await apiClient.get<ConversionFunnel>(
      `/analytics/conversion-funnel?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get channel performance data
   * GET /api/v1/analytics/channel-performance
   * Accepts date range parameters for filtering
   */
  getChannelPerformance: async (startDate?: string, endDate?: string): Promise<ChannelPerformance[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    
    const response = await apiClient.get<ChannelPerformance[]>(
      `/analytics/channel-performance${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get ROI data
   * GET /api/v1/analytics/roi
   */
  getRoi: async (): Promise<unknown> => {
    const response = await apiClient.get('/analytics/roi');
    return response.data;
  },

  /**
   * Get AI usage analytics
   * GET /api/v1/analytics/ai-usage
   */
  getAIUsage: async (startDate?: string, endDate?: string): Promise<AIUsageSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const response = await apiClient.get<AIUsageSummary>(
      `/analytics/ai-usage${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get sentiment analytics for messages
   * GET /api/v1/analytics/sentiment
   * Sprint 36 Feature
   */
  getSentimentAnalytics: async (startDate?: string, endDate?: string): Promise<SentimentAnalyticsDto> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    const response = await apiClient.get<SentimentAnalyticsDto>(
      `/analytics/sentiment${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },
};

// ============================================================================
// Sentiment Analytics Types (Sprint 36)
// ============================================================================

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
}

export interface SentimentTrendPoint {
  date: string;
  averageScore: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  totalCount: number;
}

export interface ChannelSentiment {
  channel: string;
  averageScore: number;
  distribution: SentimentDistribution;
  totalMessages: number;
}

export interface SentimentAnalyticsDto {
  overall: SentimentDistribution;
  trend: SentimentTrendPoint[];
  byChannel: ChannelSentiment[];
  averageScore: number;
  totalMessagesAnalyzed: number;
  dateFrom: string;
  dateTo: string;
}
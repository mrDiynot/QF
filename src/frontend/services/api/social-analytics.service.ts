/**
 * Social Channel Analytics API Service
 * Handles analytics for Instagram, Facebook, and WhatsApp channels
 */

import { apiClient } from '@/lib/axios';

// ============================================================================
// Types
// ============================================================================

export interface DateRange {
  start: string;
  end: string;
}

export interface SocialMessagingMetrics {
  inboundMessages: number;
  outboundMessages: number;
  totalMessages: number;
  uniqueConversations: number;
  avgMessagesPerConversation: number;
  deliveredMessages: number;
  readMessages: number;
  deliveryRate: number;
  readRate: number;
}

export interface SocialEngagementMetrics {
  newConversationsInitiated: number;
  conversationsWithResponses: number;
  leadResponseRate: number;
  avgConversationDurationMinutes: number;
  quickReplyClicks: number;
  quickReplyEngagementRate: number;
  positiveSentimentConversations: number;
  negativeSentimentConversations: number;
  overallSentimentScore: number;
}

export interface SocialAIMetrics {
  aiResponses: number;
  humanResponses: number;
  aiCoverageRate: number;
  handoffCount: number;
  handoffRate: number;
  avgAIResponseTimeSeconds: number;
  successfulQualifications: number;
  qualificationRate: number;
}

export interface ResponseWindowMetrics {
  withinWindowResponses: number;
  outsideWindowResponses: number;
  complianceRate: number;
  avgResponseTimeMinutes: number;
  conversationsAtRisk: number;
}

export interface SocialConversionMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  qualificationRate: number;
  conversionRate: number;
  bookingsMade: number;
  bookingRate: number;
  avgLeadScore: number;
}

export interface SocialTrends {
  messagesChange: number;
  conversationsChange: number;
  leadsChange: number;
  conversionRateChange: number;
  responseTimeChange: number;
  aiCoverageChange: number;
  sentimentChange: number;
}

export interface SocialChannelAnalytics {
  channelId: string;
  channelType: string;
  pageName: string;
  period: DateRange;
  messaging: SocialMessagingMetrics;
  engagement: SocialEngagementMetrics;
  aiPerformance: SocialAIMetrics;
  responseWindow: ResponseWindowMetrics;
  conversion: SocialConversionMetrics;
  trends: SocialTrends;
}

export interface SocialChannelsSummary {
  period: DateRange;
  totalChannels: number;
  activeChannels: number;
  totalMessaging: SocialMessagingMetrics;
  totalConversion: SocialConversionMetrics;
  overallAICoverage: number;
  overallComplianceRate: number;
  channelBreakdown: SocialChannelAnalytics[];
}

export interface AtRiskConversations {
  count: number;
  conversationIds: string[];
}

// ============================================================================
// Service
// ============================================================================

export const socialAnalyticsService = {
  /**
   * Get comprehensive analytics for a specific social channel
   * GET /api/v1/analytics/social/{channelId}
   */
  getChannelAnalytics: async (
    channelId: string,
    startDate?: string,
    endDate?: string
  ): Promise<SocialChannelAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();

    const response = await apiClient.get<SocialChannelAnalytics>(
      `/analytics/social/${channelId}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get summary analytics across all social channels
   * GET /api/v1/analytics/social/summary
   */
  getSocialSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<SocialChannelsSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();

    const response = await apiClient.get<SocialChannelsSummary>(
      `/analytics/social/summary${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get conversations at risk of exceeding 24-hour response window
   * GET /api/v1/analytics/social/at-risk
   */
  getAtRiskConversations: async (
    channelId?: string
  ): Promise<AtRiskConversations> => {
    const params = new URLSearchParams();
    if (channelId) params.append('channelId', channelId);
    const queryString = params.toString();

    const response = await apiClient.get<AtRiskConversations>(
      `/analytics/social/at-risk${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  /**
   * Get response window compliance metrics
   * GET /api/v1/analytics/social/{channelId}/response-window
   */
  getResponseWindowMetrics: async (
    channelId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ResponseWindowMetrics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();

    const response = await apiClient.get<ResponseWindowMetrics>(
      `/analytics/social/${channelId}/response-window${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },
};


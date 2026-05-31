/**
 * Social Channel Analytics React Query Hooks
 *
 * Provides hooks for fetching Instagram, Facebook, and WhatsApp analytics
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { socialAnalyticsService } from '@/services/api/social-analytics.service';
import { queryConfig } from '@/lib/query-config';

/**
 * Custom retry function that doesn't retry on rate-limit (429) errors
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 3) return false;
  
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status === 429) return false;
    if (status && status >= 400 && status < 500 && status !== 408) return false;
  }
  
  return true;
};

export const socialAnalyticsKeys = {
  all: ['social-analytics'] as const,
  channel: (channelId: string, startDate?: string, endDate?: string) => 
    [...socialAnalyticsKeys.all, 'channel', channelId, { startDate, endDate }] as const,
  summary: (startDate?: string, endDate?: string) => 
    [...socialAnalyticsKeys.all, 'summary', { startDate, endDate }] as const,
  atRisk: (channelId?: string) => 
    [...socialAnalyticsKeys.all, 'at-risk', { channelId }] as const,
  responseWindow: (channelId: string, startDate?: string, endDate?: string) => 
    [...socialAnalyticsKeys.all, 'response-window', channelId, { startDate, endDate }] as const,
};

/**
 * Hook to fetch analytics for a specific social channel
 */
export function useSocialChannelAnalytics(
  channelId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: socialAnalyticsKeys.channel(channelId, startDate, endDate),
    queryFn: () => socialAnalyticsService.getChannelAnalytics(channelId, startDate, endDate),
    enabled: enabled && !!channelId,
    ...queryConfig.dashboard, // Dashboard metrics with polling
    retry: shouldRetry,
  });
}

/**
 * Hook to fetch summary analytics across all social channels
 */
export function useSocialChannelsSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: socialAnalyticsKeys.summary(startDate, endDate),
    queryFn: () => socialAnalyticsService.getSocialSummary(startDate, endDate),
    ...queryConfig.dashboard,
    retry: shouldRetry,
  });
}

/**
 * Hook to fetch conversations at risk of exceeding 24-hour response window
 */
export function useAtRiskConversations(channelId?: string) {
  return useQuery({
    queryKey: socialAnalyticsKeys.atRisk(channelId),
    queryFn: () => socialAnalyticsService.getAtRiskConversations(channelId),
    ...queryConfig.realtime, // Real-time for at-risk conversations
    refetchInterval: 60 * 1000, // Override: Check every minute for at-risk conversations
    retry: shouldRetry,
  });
}

/**
 * Hook to fetch response window compliance metrics
 */
export function useResponseWindowMetrics(
  channelId: string,
  startDate?: string,
  endDate?: string,
  enabled = true
) {
  return useQuery({
    queryKey: socialAnalyticsKeys.responseWindow(channelId, startDate, endDate),
    queryFn: () => socialAnalyticsService.getResponseWindowMetrics(channelId, startDate, endDate),
    enabled: enabled && !!channelId,
    ...queryConfig.dashboard,
    retry: shouldRetry,
  });
}


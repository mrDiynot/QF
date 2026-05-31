/**
 * Analytics React Query Hooks
 *
 * All dashboard-related hooks use consistent query keys and refetch intervals
 * to ensure real-time data display across the dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { analyticsService } from '@/services/api';
import { queryConfig } from '@/lib/query-config';

/**
 * Custom retry function that doesn't retry on rate-limit (429) errors
 * Also doesn't retry on 4xx client errors (except 408 Request Timeout)
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 3) return false;
  
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // Don't retry on rate-limit (429) or client errors (4xx except 408)
    if (status === 429) return false;
    if (status && status >= 400 && status < 500 && status !== 408) return false;
  }
  
  return true;
};

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (startDate?: string, endDate?: string) => [...analyticsKeys.all, 'dashboard', { startDate, endDate }] as const,
  funnel: () => [...analyticsKeys.all, 'funnel'] as const,
  channels: (startDate?: string, endDate?: string) => [...analyticsKeys.all, 'channels', { startDate, endDate }] as const,
  roi: () => [...analyticsKeys.all, 'roi'] as const,
  aiUsage: (startDate?: string, endDate?: string) => [...analyticsKeys.all, 'ai-usage', { startDate, endDate }] as const,
};

export function useDashboardMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(startDate, endDate),
    queryFn: () => analyticsService.getDashboardMetrics(startDate, endDate),
    ...queryConfig.dashboard, // includes refetchInterval: 30s and refetchOnWindowFocus: true
    retry: 0, // Fail fast on first load; polling handles subsequent refreshes
  });
}

export function useConversionFunnel() {
  return useQuery({
    queryKey: analyticsKeys.funnel(),
    queryFn: analyticsService.getConversionFunnel,
    ...queryConfig.dashboard,
    retry: shouldRetry,
  });
}

export function useChannelPerformance(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: analyticsKeys.channels(startDate, endDate),
    queryFn: () => analyticsService.getChannelPerformance(startDate, endDate),
    ...queryConfig.dashboard,
    retry: shouldRetry,
  });
}

export function useRoi() {
  return useQuery({
    queryKey: analyticsKeys.roi(),
    queryFn: analyticsService.getRoi,
    ...queryConfig.standard, // ROI data can be stale for longer
    retry: shouldRetry,
  });
}

export function useAIUsage(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: analyticsKeys.aiUsage(startDate, endDate),
    queryFn: () => analyticsService.getAIUsage(startDate, endDate),
    ...queryConfig.dashboard,
    retry: shouldRetry,
    // Don't refetch on window focus when already rate-limited
    refetchOnWindowFocus: false,
  });
}
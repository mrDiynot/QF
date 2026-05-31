/**
 * AI Insights React Query Hooks
 *
 * Provides hooks for fetching and managing AI-powered business insights.
 * Dashboard insights are cached for 1 hour on the backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/api';
import type { InsightsRequest } from '@/types/ai-insights';

// Query key factory for AI insights
export const aiInsightsKeys = {
  all: ['ai-insights'] as const,
  dashboard: () => [...aiInsightsKeys.all, 'dashboard'] as const,
  custom: (request: InsightsRequest) => [...aiInsightsKeys.all, 'custom', request] as const,
};

// Stale time - dashboard insights are cached for 1 hour on backend,
// so we can keep them stale for a bit longer on the client
const INSIGHTS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch AI-powered dashboard insights.
 * Results are cached for 1 hour on the backend.
 */
export function useAIDashboardInsights(enabled = true) {
  return useQuery({
    queryKey: aiInsightsKeys.dashboard(),
    queryFn: () => aiService.getDashboardInsights(),
    staleTime: INSIGHTS_STALE_TIME,
    // Don't refetch on window focus since insights are cached
    refetchOnWindowFocus: false,
    // Retry on failure
    retry: 2,
    // Only enable when explicitly requested
    enabled,
  });
}

/**
 * Hook to generate custom AI insights with specific parameters.
 */
export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: InsightsRequest) => aiService.generateInsights(request),
    onSuccess: (data, variables) => {
      // Cache the custom insights result
      queryClient.setQueryData(aiInsightsKeys.custom(variables), data);
    },
  });
}

/**
 * Hook to refresh dashboard insights by clearing the cache.
 */
export function useRefreshDashboardInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiService.refreshDashboardInsights(),
    onSuccess: (data) => {
      // Update the dashboard insights cache with fresh data
      queryClient.setQueryData(aiInsightsKeys.dashboard(), data);
    },
  });
}

/**
 * Combined hook for AI insights with refresh capability.
 * Provides dashboard insights data along with a refresh function.
 */
export function useAIInsights(enabled = true) {
  const dashboardQuery = useAIDashboardInsights(enabled);
  const refreshMutation = useRefreshDashboardInsights();

  return {
    // Data and loading states
    data: dashboardQuery.data,
    insights: dashboardQuery.data?.insights ?? [],
    summary: dashboardQuery.data?.summary,
    trends: dashboardQuery.data?.trends,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    isFetching: dashboardQuery.isFetching,

    // Refresh functionality
    refresh: refreshMutation.mutate,
    refreshAsync: refreshMutation.mutateAsync,
    isRefreshing: refreshMutation.isPending,

    // Query control
    refetch: dashboardQuery.refetch,
  };
}


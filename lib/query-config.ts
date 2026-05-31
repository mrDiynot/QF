/**
 * Standardized React Query Configuration
 * 
 * This module provides consistent caching patterns across the platform
 * to ensure real-time data propagation after mutations.
 * 
 * IMPORTANT: Always use these configurations for production-grade UX.
 */

import type { QueryClient } from '@tanstack/react-query';

/**
 * Standard query options for different data types.
 * Use these to ensure consistent behavior across all hooks.
 */
export const queryConfig = {
  /**
   * For frequently changing data that should always be fresh
   * Examples: leads, contacts, conversations, notifications
   */
  realtime: {
    staleTime: 5 * 1000, // 5 seconds - data becomes stale quickly
    gcTime: 30 * 1000, // 30 seconds - garbage collect old cache quickly
    refetchOnMount: 'always' as const,
    refetchOnWindowFocus: true,
  },

  /**
   * For data that changes moderately often
   * Examples: deals, workflows, team members, channels
   */
  standard: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true as const,
    refetchOnWindowFocus: true,
  },

  /**
   * For relatively static data that rarely changes
   * Examples: subscription plans, system settings, templates
   */
  static: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true as const,
    refetchOnWindowFocus: false,
  },

  /**
   * For dashboard metrics with auto-refresh
   * Uses polling for real-time updates
   */
  dashboard: {
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 60 * 1000, // 1 minute
    refetchOnMount: 'always' as const,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  },

  /**
   * For detail views (single entity)
   * More aggressive caching since usually navigated to intentionally
   */
  detail: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true as const,
    refetchOnWindowFocus: false,
  },
} as const;

/**
 * Helper to invalidate and remove queries after a mutation.
 * This ensures fresh data is fetched on next navigation.
 * 
 * @param queryClient - The React Query client
 * @param queryKeys - Array of query keys to invalidate
 */
export function invalidateAndRemove(
  queryClient: QueryClient,
  queryKeys: readonly unknown[][]
): void {
  queryKeys.forEach((queryKey) => {
    // Remove cached data completely to force fresh fetch
    queryClient.removeQueries({ queryKey });
    // Then invalidate to trigger refetch for any active queries
    queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
  });
}

/**
 * Helper for mutations that affect list data.
 * Removes old cache and invalidates to ensure fresh data.
 *
 * @param queryClient - The React Query client
 * @param listKeys - The query keys for list queries (e.g., leadsKeys.all)
 * @param additionalKeys - Optional additional keys to invalidate (e.g., analytics)
 */
export function invalidateListQueries(
  queryClient: QueryClient,
  listKeys: readonly unknown[],
  additionalKeys?: readonly (readonly unknown[])[]
): void {
  // Cast to mutable array for React Query's types
  const mutableListKeys = [...listKeys] as unknown[];

  // Remove and invalidate the main list queries
  queryClient.removeQueries({ queryKey: mutableListKeys });
  queryClient.invalidateQueries({ queryKey: mutableListKeys, refetchType: 'all' });

  // Invalidate additional related queries
  if (additionalKeys) {
    additionalKeys.forEach((key) => {
      const mutableKey = [...key] as unknown[];
      queryClient.invalidateQueries({ queryKey: mutableKey, refetchType: 'all' });
    });
  }
}


/**
 * React Query hooks for Activity API
 */

import { useQuery } from '@tanstack/react-query';
import {
  activityService,
  type ActivityItem,
  type ActivityParams,
  type ActivityByEntityParams,
  type ActivityByUserParams
} from '@/services/api/activity.service';
import { queryConfig } from '@/lib/query-config';

// Query keys
export const activityKeys = {
  all: ['activity'] as const,
  recent: (params?: ActivityParams) => [...activityKeys.all, 'recent', params] as const,
  byEntity: (params: ActivityByEntityParams) => [...activityKeys.all, 'entity', params] as const,
  byUser: (params: ActivityByUserParams) => [...activityKeys.all, 'user', params] as const,
};

/**
 * Fetch recent activity
 */
export function useRecentActivity(params: ActivityParams = {}) {
  return useQuery({
    queryKey: activityKeys.recent(params),
    queryFn: () => activityService.getRecentActivity(params),
    ...queryConfig.dashboard, // Activity needs dashboard-style polling
  });
}

/**
 * Fetch activity by entity type
 */
export function useActivityByEntityType(params: ActivityByEntityParams) {
  return useQuery({
    queryKey: activityKeys.byEntity(params),
    queryFn: () => activityService.getActivityByEntityType(params),
    enabled: !!params.entityType,
    ...queryConfig.standard,
  });
}

/**
 * Fetch activity by user
 */
export function useActivityByUser(params: ActivityByUserParams) {
  return useQuery({
    queryKey: activityKeys.byUser(params),
    queryFn: () => activityService.getActivityByUser(params),
    enabled: !!params.userId,
    ...queryConfig.standard,
  });
}

// Type exports
export type { ActivityItem };

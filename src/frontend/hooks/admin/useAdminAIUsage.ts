'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAIUsageService } from '@/services/api/admin.service';
import { queryConfig } from '@/lib/query-config';

export function useAdminAIUsageSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin', 'ai-usage', 'platform-summary', from, to],
    queryFn: () => adminAIUsageService.getPlatformSummary(from, to),
    ...queryConfig.dashboard,
  });
}

export function useAdminBusinessAIUsage(businessId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['admin', 'ai-usage', 'business', businessId, from, to],
    queryFn: () => adminAIUsageService.getBusinessUsage(businessId, from, to),
    enabled: !!businessId,
    ...queryConfig.dashboard,
  });
}

export function useAdminTopAIBusinesses(from?: string, to?: string, limit = 10) {
  return useQuery({
    queryKey: ['admin', 'ai-usage', 'top-businesses', from, to, limit],
    queryFn: () => adminAIUsageService.getTopBusinesses(from, to, limit),
    ...queryConfig.dashboard,
  });
}

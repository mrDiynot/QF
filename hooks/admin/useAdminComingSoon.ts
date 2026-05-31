'use client';

import { useQuery } from '@tanstack/react-query';
import { adminComingSoonService } from '@/services/api/admin.service';
import { queryConfig } from '@/lib/query-config';

export function useComingSoonOverview(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'overview', startDate, endDate],
    queryFn: () => adminComingSoonService.getOverview(startDate, endDate),
    ...queryConfig.dashboard,
  });
}

export function useComingSoonChatSessions(
  page = 1,
  pageSize = 20,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'chat-sessions', page, pageSize, startDate, endDate],
    queryFn: () => adminComingSoonService.getChatSessions(page, pageSize, startDate, endDate),
    ...queryConfig.dashboard,
  });
}

export function useComingSoonWaitlist(
  page = 1,
  pageSize = 20,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'waitlist', page, pageSize, startDate, endDate],
    queryFn: () => adminComingSoonService.getWaitlistEntries(page, pageSize, startDate, endDate),
    ...queryConfig.dashboard,
  });
}

export function useComingSoonAIUsage(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'ai-usage', startDate, endDate],
    queryFn: () => adminComingSoonService.getAIUsage(startDate, endDate),
    ...queryConfig.dashboard,
  });
}

export function useComingSoonIntentDistribution(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'intents', startDate, endDate],
    queryFn: () => adminComingSoonService.getIntentDistribution(startDate, endDate),
    ...queryConfig.dashboard,
  });
}

export function useComingSoonConversionFunnel(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'coming-soon', 'funnel', startDate, endDate],
    queryFn: () => adminComingSoonService.getConversionFunnel(startDate, endDate),
    ...queryConfig.dashboard,
  });
}

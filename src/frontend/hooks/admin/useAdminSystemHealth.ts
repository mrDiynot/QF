'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSystemHealthService } from '@/services/api/admin.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const systemKeys = {
  all: ['admin', 'system'] as const,
  health: ['admin', 'system', 'health'] as const,
  jobs: ['admin', 'system', 'jobs'] as const,
};

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: systemKeys.health,
    queryFn: () => adminSystemHealthService.getHealth(),
    ...queryConfig.dashboard, // Real-time health monitoring with polling
  });
}

export function useAdminBackgroundJobs() {
  return useQuery({
    queryKey: systemKeys.jobs,
    queryFn: () => adminSystemHealthService.getJobs(),
    ...queryConfig.realtime, // Jobs need real-time updates
    refetchInterval: 10000, // Override with 10s polling for jobs
  });
}

export function useAdminExternalUsage() {
  return useQuery({
    queryKey: ['admin', 'system', 'external-usage'],
    queryFn: () => adminSystemHealthService.getExternalUsage(),
    ...queryConfig.dashboard,
  });
}

export function useVerifySeedData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminSystemHealthService.verifySeedData(),
    onSuccess: () => {
      invalidateListQueries(queryClient, systemKeys.all);
    },
  });
}

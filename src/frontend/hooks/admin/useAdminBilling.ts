'use client';

import { useQuery } from '@tanstack/react-query';
import { adminBillingService } from '@/services/api/admin.service';
import { queryConfig } from '@/lib/query-config';

export function useAdminBillingMetrics() {
  return useQuery({
    queryKey: ['admin', 'billing', 'metrics'],
    queryFn: () => adminBillingService.getMetrics(),
    ...queryConfig.dashboard,
  });
}

export function useAdminMrrHistory(months = 12) {
  return useQuery({
    queryKey: ['admin', 'billing', 'mrr-history', months],
    queryFn: () => adminBillingService.getMrrHistory(months),
    ...queryConfig.static, // Historical data doesn't change often
  });
}

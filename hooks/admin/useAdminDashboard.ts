'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import { queryConfig } from '@/lib/query-config';

export function useAdminDashboard() {
  const { track, trackAdminPageView } = useAdminAnalytics();

  // Track dashboard view on mount
  useEffect(() => {
    trackAdminPageView('Admin Dashboard');
    track(AdminEvents.ADMIN_DASHBOARD_VIEWED);
  }, [track, trackAdminPageView]);

  const query = useQuery({
    queryKey: ['admin', 'dashboard', 'metrics'],
    queryFn: async () => {
      const data = await adminDashboardService.getMetrics();
      return data;
    },
    ...queryConfig.dashboard, // Use dashboard config with polling
  });

  // Track manual refreshes
  const refetch = async () => {
    track(AdminEvents.ADMIN_DASHBOARD_REFRESHED);
    return query.refetch();
  };

  return {
    ...query,
    refetch,
  };
}


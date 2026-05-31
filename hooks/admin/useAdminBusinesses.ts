'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminBusinessService, adminUserService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import type { AdminBusinessQuery } from '@/types/admin';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const adminKeys = {
  businesses: ['admin', 'businesses'] as const,
};

export function useAdminBusinesses(query: AdminBusinessQuery) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'businesses', query],
    queryFn: async () => {
      if (query.search) {
        track(AdminEvents.ADMIN_BUSINESS_SEARCHED, {
          search_term: query.search,
          status_filter: query.status,
        });
      }
      return adminBusinessService.getBusinesses(query);
    },
    ...queryConfig.standard,
  });
}

export function useAdminBusiness(id: string) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'businesses', id],
    queryFn: async () => {
      track(AdminEvents.ADMIN_BUSINESS_VIEWED, { business_id: id });
      return adminBusinessService.getBusiness(id);
    },
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useSuspendBusiness() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ businessId, reason }: { businessId: string; reason: string }) => {
      track(AdminEvents.ADMIN_BUSINESS_SUSPENDED, {
        business_id: businessId,
        reason,
      });
      return adminBusinessService.suspendBusiness(businessId, reason);
    },
    onSuccess: (_, { businessId }) => {
      invalidateListQueries(queryClient, adminKeys.businesses);
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses', businessId], refetchType: 'all' });
      toast.success('Business suspended successfully');
    },
    onError: (error, { businessId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Suspend failed'), {
        action: 'suspend_business',
        business_id: businessId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to suspend business');
    },
  });
}

export function useReactivateBusiness() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (businessId: string) => {
      track(AdminEvents.ADMIN_BUSINESS_REACTIVATED, { business_id: businessId });
      return adminBusinessService.reactivateBusiness(businessId);
    },
    onSuccess: (_, businessId) => {
      invalidateListQueries(queryClient, adminKeys.businesses);
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses', businessId], refetchType: 'all' });
      toast.success('Business reactivated successfully');
    },
    onError: (error, businessId) => {
      trackAdminError(error instanceof Error ? error : new Error('Reactivate failed'), {
        action: 'reactivate_business',
        business_id: businessId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate business');
    },
  });
}

export function useAdminBusinessUsers(businessId: string) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'businesses', businessId, 'users'],
    queryFn: async () => {
      track(AdminEvents.ADMIN_USER_SEARCHED, { business_id: businessId });
      return adminUserService.getBusinessUsers(businessId);
    },
    enabled: !!businessId,
    ...queryConfig.standard,
  });
}

export interface BusinessActivity {
  id: string;
  action: string;
  actor: string;
  actorEmail?: string;
  timestamp: string;
  details?: string; // Backend sends string?, not Record<string, unknown>
}

export function useAdminBusinessActivity(businessId: string) {
  return useQuery({
    queryKey: ['admin', 'businesses', businessId, 'activity'],
    queryFn: async () => {
      return adminBusinessService.getBusinessActivity(businessId);
    },
    enabled: !!businessId,
    ...queryConfig.standard,
  });
}


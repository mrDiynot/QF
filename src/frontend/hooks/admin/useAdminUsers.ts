'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminUserService, AdminUserQuery } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const adminUserKeys = {
  all: ['admin', 'users'] as const,
};

export function useAdminUsers(query: AdminUserQuery) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: async () => {
      if (query.search) {
        track(AdminEvents.ADMIN_USER_SEARCHED, {
          search_term: query.search,
          business_filter: query.businessId,
          role_filter: query.role,
          status_filter: query.status,
        });
      }
      return adminUserService.getUsers(query);
    },
    ...queryConfig.standard,
  });
}

export function useAdminUser(userId: string) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      track(AdminEvents.ADMIN_USER_VIEWED, { user_id: userId });
      return adminUserService.getUser(userId);
    },
    enabled: !!userId,
    ...queryConfig.detail,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => {
      track(AdminEvents.ADMIN_USER_SUSPENDED, { user_id: userId, reason });
      return adminUserService.suspendUser(userId, reason);
    },
    onSuccess: (_, { userId }) => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId], refetchType: 'all' });
      toast.success('User suspended successfully');
    },
    onError: (error, { userId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Suspend failed'), {
        action: 'suspend_user',
        user_id: userId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to suspend user');
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (userId: string) => {
      track(AdminEvents.ADMIN_USER_REACTIVATED, { user_id: userId });
      return adminUserService.reactivateUser(userId);
    },
    onSuccess: (_, userId) => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId], refetchType: 'all' });
      toast.success('User reactivated successfully');
    },
    onError: (error, userId) => {
      trackAdminError(error instanceof Error ? error : new Error('Reactivate failed'), {
        action: 'reactivate_user',
        user_id: userId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate user');
    },
  });
}

export function useResetUserPassword() {
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (userId: string) => {
      track(AdminEvents.ADMIN_PASSWORD_RESET_SENT, { user_id: userId });
      return adminUserService.resetPassword(userId);
    },
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error, userId) => {
      trackAdminError(error instanceof Error ? error : new Error('Password reset failed'), {
        action: 'reset_password',
        user_id: userId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to send password reset email');
    },
  });
}


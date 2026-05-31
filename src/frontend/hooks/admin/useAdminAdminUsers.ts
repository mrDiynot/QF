'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminAdminUserService, type AdminUserQuery } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const adminUserKeys = {
  all: ['admin', 'admin-users'] as const,
  list: (query?: AdminUserQuery) => ['admin', 'admin-users', 'list', query] as const,
  detail: (id: string) => ['admin', 'admin-users', 'detail', id] as const,
};

export function useAdminAdminUsers(query?: AdminUserQuery) {
  return useQuery({
    queryKey: adminUserKeys.list(query),
    queryFn: () => adminAdminUserService.getAdminUsers(query),
    ...queryConfig.standard,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => adminAdminUserService.getAdminUser(id),
    ...queryConfig.standard,
    enabled: !!id,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (request: { email: string; firstName: string; lastName: string; role: string; ipWhitelist?: string[] }) => {
      track(AdminEvents.ADMIN_USER_CREATED, { role: request.role, email: request.email });
      return adminAdminUserService.createAdminUser(request);
    },
    onSuccess: (_data) => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      // Don't show toast here - let the UI handle showing the password
    },
    onError: (error) => {
      trackAdminError(error instanceof Error ? error : new Error('Create admin failed'), {
        action: 'create_admin_user',
      });
      toast.error(error instanceof Error ? error.message : 'Failed to create admin user');
    },
  });
}

export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => {
      track(AdminEvents.ADMIN_USER_ROLE_CHANGED, { admin_id: id, new_role: role });
      return adminAdminUserService.updateAdminUserRole(id, role);
    },
    onSuccess: () => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      toast.success('Role updated');
    },
    onError: (error, { id }) => {
      trackAdminError(error instanceof Error ? error : new Error('Update role failed'), {
        action: 'update_admin_role',
        admin_id: id,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    },
  });
}

export function useUpdateAdminUserIpWhitelist() {
  const queryClient = useQueryClient();
  const { trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ id, ipWhitelist }: { id: string; ipWhitelist: string[] }) => {
      return adminAdminUserService.updateAdminUserIpWhitelist(id, ipWhitelist);
    },
    onSuccess: () => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      toast.success('IP whitelist updated');
    },
    onError: (error, { id }) => {
      trackAdminError(error instanceof Error ? error : new Error('Update IP whitelist failed'), {
        action: 'update_ip_whitelist',
        admin_id: id,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to update IP whitelist');
    },
  });
}

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (id: string) => {
      track(AdminEvents.ADMIN_USER_DEACTIVATED, { admin_id: id });
      return adminAdminUserService.deactivateAdminUser(id);
    },
    onSuccess: () => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      toast.success('Admin user deactivated');
    },
    onError: (error, id) => {
      trackAdminError(error instanceof Error ? error : new Error('Deactivate failed'), {
        action: 'deactivate_admin',
        admin_id: id,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate admin user');
    },
  });
}

export function useReactivateAdminUser() {
  const queryClient = useQueryClient();
  const { trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (id: string) => {
      return adminAdminUserService.reactivateAdminUser(id);
    },
    onSuccess: () => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      toast.success('Admin user reactivated');
    },
    onError: (error, id) => {
      trackAdminError(error instanceof Error ? error : new Error('Reactivate failed'), {
        action: 'reactivate_admin',
        admin_id: id,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate admin user');
    },
  });
}

export function useResetAdminPassword() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (id: string) => {
      track(AdminEvents.ADMIN_PASSWORD_RESET_SENT, { admin_id: id });
      return adminAdminUserService.resetAdminPassword(id);
    },
    onSuccess: () => {
      invalidateListQueries(queryClient, adminUserKeys.all);
      // Don't show toast here - let the UI handle showing the password
    },
    onError: (error, id) => {
      trackAdminError(error instanceof Error ? error : new Error('Password reset failed'), {
        action: 'reset_admin_password',
        admin_id: id,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    },
  });
}


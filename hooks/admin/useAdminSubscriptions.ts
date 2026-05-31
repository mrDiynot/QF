'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminSubscriptionService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import type {
  AdminSubscriptionQuery,
  ChangePlanRequest,
  CancelSubscriptionRequest,
} from '@/types/admin';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

const subscriptionKeys = {
  all: ['admin', 'subscriptions'] as const,
  metrics: ['admin', 'subscriptions', 'metrics'] as const,
};

export function useAdminSubscriptions(query: AdminSubscriptionQuery) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'subscriptions', query],
    queryFn: async () => {
      if (query.search) {
        track(AdminEvents.ADMIN_SUBSCRIPTION_SEARCHED, {
          search_term: query.search,
          status_filter: query.status,
        });
      }
      return adminSubscriptionService.getSubscriptions(query);
    },
    ...queryConfig.standard,
  });
}

export function useAdminSubscription(id: string) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: ['admin', 'subscriptions', id],
    queryFn: async () => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_VIEWED, { subscription_id: id });
      return adminSubscriptionService.getSubscription(id);
    },
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useAdminSubscriptionMetrics() {
  return useQuery({
    queryKey: subscriptionKeys.metrics,
    queryFn: () => adminSubscriptionService.getMetrics(),
    ...queryConfig.dashboard,
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminSubscriptionService.getPlans(),
    ...queryConfig.static, // Plans don't change often
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      request,
    }: {
      subscriptionId: string;
      request: ChangePlanRequest;
    }) => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_PLAN_CHANGED, {
        subscription_id: subscriptionId,
        new_plan_id: request.newPlanId,
      });
      return adminSubscriptionService.changePlan(subscriptionId, request);
    },
    onSuccess: (_, { subscriptionId }) => {
      invalidateListQueries(queryClient, subscriptionKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', subscriptionId], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.metrics, refetchType: 'all' });
      toast.success('Plan changed successfully');
    },
    onError: (error, { subscriptionId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Plan change failed'), {
        action: 'change_plan',
        subscription_id: subscriptionId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to change plan');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      request,
    }: {
      subscriptionId: string;
      request: CancelSubscriptionRequest;
    }) => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_CANCELED, {
        subscription_id: subscriptionId,
        reason: request.reason,
      });
      return adminSubscriptionService.cancelSubscription(subscriptionId, request);
    },
    onSuccess: (_, { subscriptionId }) => {
      invalidateListQueries(queryClient, subscriptionKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', subscriptionId], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.metrics, refetchType: 'all' });
      toast.success('Subscription cancelled');
    },
    onError: (error, { subscriptionId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Cancel failed'), {
        action: 'cancel_subscription',
        subscription_id: subscriptionId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_REACTIVATED, {
        subscription_id: subscriptionId,
      });
      return adminSubscriptionService.reactivateSubscription(subscriptionId);
    },
    onSuccess: (_, subscriptionId) => {
      invalidateListQueries(queryClient, subscriptionKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', subscriptionId], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.metrics, refetchType: 'all' });
      toast.success('Subscription reactivated');
    },
    onError: (error, subscriptionId) => {
      trackAdminError(error instanceof Error ? error : new Error('Reactivate failed'), {
        action: 'reactivate_subscription',
        subscription_id: subscriptionId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    },
  });
}

export function useExtendTrial() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({ subscriptionId, days }: { subscriptionId: string; days: number }) => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_TRIAL_EXTENDED, {
        subscription_id: subscriptionId,
        days,
      });
      return adminSubscriptionService.extendTrial(subscriptionId, days);
    },
    onSuccess: (_, { subscriptionId, days }) => {
      invalidateListQueries(queryClient, subscriptionKeys.all);
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', subscriptionId], refetchType: 'all' });
      toast.success(`Trial extended by ${days} days`);
    },
    onError: (error, { subscriptionId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Extend trial failed'), {
        action: 'extend_trial',
        subscription_id: subscriptionId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to extend trial');
    },
  });
}

export function useApplyCredit() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      amount,
      reason,
    }: {
      subscriptionId: string;
      amount: number;
      reason: string;
    }) => {
      track(AdminEvents.ADMIN_SUBSCRIPTION_CREDIT_APPLIED, {
        subscription_id: subscriptionId,
        amount,
      });
      return adminSubscriptionService.applyCredit(subscriptionId, amount, reason);
    },
    onSuccess: (_, { subscriptionId, amount }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', subscriptionId], refetchType: 'all' });
      toast.success(`$${amount.toFixed(2)} credit applied`);
    },
    onError: (error, { subscriptionId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Apply credit failed'), {
        action: 'apply_credit',
        subscription_id: subscriptionId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to apply credit');
    },
  });
}

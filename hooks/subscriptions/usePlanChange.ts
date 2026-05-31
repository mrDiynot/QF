/**
 * Plan Change Hook
 * React Query hook for managing subscription plan upgrades and downgrades
 * Handles checkout flow, direct upgrades, and analytics tracking
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { useCurrentSubscription, subscriptionKeys } from './useSubscriptions';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { BillingInterval, Subscription } from '@/types/api';
import { invalidateListQueries } from '@/lib/query-config';

interface UsePlanChangeOptions {
  /** Called when upgrade/downgrade succeeds */
  onSuccess?: (subscription: Subscription, isUpgrade: boolean) => void;
  /** Called when upgrade/downgrade fails */
  onError?: (error: Error) => void;
  /** Analytics source for tracking */
  source?: 'onboarding' | 'settings' | 'limit_reached' | 'banner';
}

interface PlanChangeResult {
  /** Current subscription data */
  subscription: Subscription | undefined;
  /** Whether subscription data is loading */
  isLoading: boolean;
  /** Upgrade to a new plan (immediate effect) */
  upgradePlan: (planId: string) => Promise<void>;
  /** Downgrade to a new plan (takes effect at end of period) */
  downgradePlan: (planId: string) => Promise<void>;
  /** Create checkout session for new subscription */
  createCheckout: (planId: string, billingInterval?: BillingInterval, includeOnboarding?: boolean) => Promise<void>;
  /** Check if a plan is an upgrade from current */
  isUpgradeFrom: (planId: string, plans: Array<{ id: string; priceMonthly: number }>) => boolean;
  /** Whether any plan change mutation is pending */
  isPending: boolean;
}

export function usePlanChange(options: UsePlanChangeOptions = {}): PlanChangeResult {
  const { onSuccess, onError, source = 'settings' } = options;
  const queryClient = useQueryClient();
  const { data: subscription, isLoading } = useCurrentSubscription();
  const { track } = useAnalytics();

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionsService.upgradePlan(planId),
    onSuccess: (data, planId) => {
      toast.success('Plan upgraded successfully!');
      invalidateListQueries(queryClient, subscriptionKeys.all);
      track('subscription_upgraded', { planId, source });
      onSuccess?.(data, true);
    },
    onError: (error: Error) => {
      toast.error('Failed to upgrade plan. Please try again.');
      track('payment_failed', { error: error.message, source, action: 'upgrade' });
      onError?.(error);
    },
  });

  // Downgrade mutation
  const downgradeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionsService.downgradePlan(planId),
    onSuccess: (data, planId) => {
      toast.success('Plan change scheduled for end of billing period.');
      invalidateListQueries(queryClient, subscriptionKeys.all);
      track('subscription_downgraded', { planId, source });
      onSuccess?.(data, false);
    },
    onError: (error: Error) => {
      toast.error('Failed to change plan. Please try again.');
      track('payment_failed', { error: error.message, source, action: 'downgrade' });
      onError?.(error);
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ planId, billingInterval, includeOnboarding }: {
      planId: string;
      billingInterval: BillingInterval;
      includeOnboarding: boolean;
    }) => {
      const result = await subscriptionsService.createCheckoutSession({
        planId,
        billingInterval,
        includeOnboarding,
        successUrl: `${window.location.origin}/settings/subscription?checkout=success`,
        cancelUrl: `${window.location.origin}/settings/subscription?checkout=canceled`,
      });
      return result;
    },
    onSuccess: (data) => {
      track('feature_used', { feature: 'checkout', source });
      window.location.href = data.checkoutUrl;
    },
    onError: (error: Error) => {
      toast.error('Failed to start checkout. Please try again.');
      track('payment_failed', { error: error.message, source, action: 'checkout' });
      onError?.(error);
    },
  });

  const upgradePlan = async (planId: string) => {
    await upgradeMutation.mutateAsync(planId);
  };

  const downgradePlan = async (planId: string) => {
    await downgradeMutation.mutateAsync(planId);
  };

  const createCheckout = async (
    planId: string,
    billingInterval: BillingInterval = 'monthly',
    includeOnboarding = false
  ) => {
    await checkoutMutation.mutateAsync({ planId, billingInterval, includeOnboarding });
  };

  const isUpgradeFrom = (
    targetPlanId: string,
    plans: Array<{ id: string; priceMonthly: number }>
  ): boolean => {
    if (!subscription?.planId) return true;
    const currentPlan = plans.find(p => p.id === subscription.planId);
    const targetPlan = plans.find(p => p.id === targetPlanId);
    if (!currentPlan || !targetPlan) return true;
    return targetPlan.priceMonthly > currentPlan.priceMonthly;
  };

  const isPending = 
    upgradeMutation.isPending || 
    downgradeMutation.isPending || 
    checkoutMutation.isPending;

  return {
    subscription,
    isLoading,
    upgradePlan,
    downgradePlan,
    createCheckout,
    isUpgradeFrom,
    isPending,
  };
}

export default usePlanChange;


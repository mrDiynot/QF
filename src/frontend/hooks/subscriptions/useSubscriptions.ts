/**
 * Subscription React Query hooks
 * Provides hooks for subscription management with caching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subscriptionsService, SubscriptionError } from '@/services/api/subscriptions.service';
import { handleApiError } from '@/lib/axios';
import type { CreateCheckoutSessionRequest, BillingInterval, Subscription } from '@/types/api';
import { queryConfig } from '@/lib/query-config';

/** Query key factory for subscriptions */
export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
};

/**
 * Hook to fetch all available subscription plans
 * Can be used on pricing page (no auth required)
 */
export const usePlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionsService.getPlans,
    ...queryConfig.static, // Plans rarely change
    staleTime: 1000 * 60 * 60, // Override: cache for 1 hour
  });
};

/**
 * Hook to fetch current subscription for the user's business
 *
 * IMPORTANT: Every business MUST have a subscription.
 * This hook provides proper error states - never falls back to a default plan.
 *
 * @returns Query result with subscription data, loading state, and error state
 */
export const useCurrentSubscription = () => {
  const query = useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionsService.getCurrentSubscription,
    ...queryConfig.standard,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: 'always' as const, // Always refetch when component mounts (fixes stale data after login)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: (failureCount, error) => {
      // Don't retry on 404 (data integrity issue) or auth errors
      if (error instanceof SubscriptionError) {
        if (error.code === 'NOT_FOUND' || error.code === 'UNAUTHORIZED') {
          return false;
        }
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  return {
    ...query,
    // Helper to check if error is a subscription error
    subscriptionError: query.error instanceof SubscriptionError ? query.error : null,
  };
};

/**
 * Type guard to check if subscription data is valid
 */
export const isValidSubscription = (data: Subscription | null | undefined): data is Subscription => {
  return data !== null && data !== undefined && typeof data.planName === 'string';
};

/**
 * Hook to fetch current usage metrics
 */
export const useSubscriptionUsage = () => {
  return useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: subscriptionsService.getUsage,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes, usage changes frequently
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

/**
 * Hook to create a Stripe checkout session
 */
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionRequest) =>
      subscriptionsService.createCheckoutSession(data),
    onSuccess: (response) => {
      // Redirect to Stripe checkout
      window.location.href = response.checkoutUrl;
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to upgrade subscription plan
 */
export const useUpgradePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionsService.upgradePlan(planId),
    onSuccess: () => {
      toast.success('Plan upgraded successfully!');
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to downgrade subscription plan
 */
export const useDowngradePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => subscriptionsService.downgradePlan(planId),
    onSuccess: () => {
      toast.success('Plan will be downgraded at the end of your billing period.');
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsService.cancelSubscription(),
    onSuccess: () => {
      toast.success('Subscription canceled. Access continues until end of billing period.');
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to reactivate a canceled subscription
 */
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsService.reactivateSubscription(),
    onSuccess: () => {
      toast.success('Subscription reactivated!');
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to get billing portal URL
 */
export const useBillingPortal = () => {
  return useMutation({
    mutationFn: (returnUrl?: string) => subscriptionsService.getBillingPortalUrl(returnUrl),
    onSuccess: (response) => {
      window.location.href = response.portalUrl;
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Convenience hook to start checkout for a specific plan
 */
export const useStartCheckout = () => {
  const createCheckout = useCreateCheckout();

  const startCheckout = (planId: string, billingInterval: BillingInterval = 'monthly') => {
    createCheckout.mutate({
      planId,
      billingInterval,
      successUrl: `${window.location.origin}/settings/billing?success=true`,
      cancelUrl: `${window.location.origin}/pricing?canceled=true`,
    });
  };

  return {
    startCheckout,
    isLoading: createCheckout.isPending,
    error: createCheckout.error,
  };
};


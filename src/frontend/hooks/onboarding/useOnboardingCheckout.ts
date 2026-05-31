/**
 * Onboarding Checkout Hook
 * Handles the payment flow integration for post-onboarding checkout
 * 
 * Flow:
 * 1. User completes step 11 (OnboardingSupport)
 * 2. If user has no active paid subscription, redirect to Stripe checkout
 * 3. After successful payment, redirect back to celebration screen
 * 4. Welcome email is sent after payment success (not onboarding completion)
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient, handleApiError } from '@/lib/axios';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';
import type { CreateCheckoutSessionRequest, BillingInterval } from '@/types/api';

export interface OnboardingCheckoutState {
  /** Whether checkout is required (user doesn't have active paid subscription) */
  requiresCheckout: boolean;
  /** Whether user is on free trial */
  isOnTrial: boolean;
  /** Whether user is on free tier */
  isFreeTier: boolean;
  /** Whether payment was successfully completed */
  paymentCompleted: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Pending plan ID from localStorage (set during registration for paid plans) */
  pendingPlanId: string | null;
  /** Pending billing interval from localStorage */
  pendingBillingInterval: BillingInterval;
  /** Whether onboarding support should be included from localStorage */
  pendingIncludeOnboarding: boolean;
}

/**
 * Hook to manage onboarding checkout flow
 */
export function useOnboardingCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription();

  // Check if we're returning from a successful checkout
  const checkoutSuccess = searchParams.get('checkout_success') === 'true';
  const checkoutCancelled = searchParams.get('checkout_cancelled') === 'true';
  const sessionId = searchParams.get('session_id');

  /**
   * Verify checkout session when returning from Stripe
   */
  const verifyCheckoutQuery = useQuery({
    queryKey: ['onboarding-checkout-verify', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      return subscriptionsService.verifyCheckoutSession(sessionId);
    },
    enabled: !!sessionId && checkoutSuccess,
    staleTime: Infinity, // Only verify once
  });

  /**
   * Create checkout session for onboarding
   */
  const createCheckoutMutation = useMutation({
    mutationFn: async (params: {
      planId: string;
      billingInterval: BillingInterval;
      includeOnboardingSupport?: boolean;
    }) => {
      console.log('[useOnboardingCheckout] createCheckoutMutation mutationFn called:', params);
      const request: CreateCheckoutSessionRequest = {
        planId: params.planId,
        billingInterval: params.billingInterval,
        // Return to onboarding with success flag
        successUrl: `${window.location.origin}/onboarding?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/onboarding?checkout_cancelled=true`,
      };
      console.log('[useOnboardingCheckout] Creating checkout session with request:', request);
      return subscriptionsService.createCheckoutSession(request);
    },
    onSuccess: (response) => {
      console.log('[useOnboardingCheckout] Checkout session created, redirecting to:', response.checkoutUrl);
      // Redirect to Stripe checkout
      window.location.href = response.checkoutUrl;
    },
    onError: (error: unknown) => {
      console.error('[useOnboardingCheckout] Checkout session creation failed:', error);
      toast.error(handleApiError(error));
    },
  });

  /**
   * Complete onboarding after successful payment
   * This is called AFTER payment success, not on regular onboarding completion
   */
  const completeWithPaymentMutation = useMutation({
    mutationFn: async () => {
      // Call the complete-with-payment endpoint that also triggers welcome email
      console.log('[useOnboardingCheckout] Calling complete-with-payment to trigger welcome email...');
      const response = await apiClient.post('/onboarding/complete-with-payment');
      console.log('[useOnboardingCheckout] complete-with-payment response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('[useOnboardingCheckout] complete-with-payment SUCCESS - welcome email should be sent');
      // Clear pending plan data from registration since payment is complete
      localStorage.removeItem('pendingPlanId');
      localStorage.removeItem('pendingBillingInterval');
      localStorage.removeItem('pendingIncludeOnboarding');
      // Clear the paymentConfirmed flag since we've completed the flow
      sessionStorage.removeItem('paymentConfirmed');

      // Invalidate queries to refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
    onError: (error: unknown) => {
      console.error('[useOnboardingCheckout] complete-with-payment FAILED:', error);
      toast.error(handleApiError(error));
    },
  });

  /**
   * Complete onboarding with free tier (no payment required)
   * This triggers the welcome email for users who don't go through payment
   */
  const completeWithFreeTierMutation = useMutation({
    mutationFn: async () => {
      // Call the complete-with-free-tier endpoint that also triggers welcome email
      console.log('[useOnboardingCheckout] Calling complete-with-free-tier to trigger welcome email...');
      const response = await apiClient.post('/onboarding/complete-with-free-tier');
      console.log('[useOnboardingCheckout] complete-with-free-tier response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('[useOnboardingCheckout] complete-with-free-tier SUCCESS - welcome email should be sent');
      // Invalidate queries to refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['subscriptions', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
    onError: (error: unknown) => {
      console.error('[useOnboardingCheckout] complete-with-free-tier FAILED:', error);
      // Don't show error toast - this is a non-critical operation
      // The user can still proceed to dashboard
    },
  });

  /**
   * Determine checkout state based on subscription status
   *
   * Subscription scenarios:
   * 1. No subscription → requires checkout
   * 2. Free tier (FreeFlow) → can skip payment, use with limitations
   * 3. Trial of FREE plan → full access to free features, can upgrade anytime
   * 4. Trial but has pendingPlanId → user selected paid plan, must complete payment
   * 5. Active paid subscription → full access, no checkout needed
   * 6. Suspended/Cancelled → requires reactivation (handled by middleware)
   * 7. Past due → payment required (handled by middleware)
   */
  const getCheckoutState = (): OnboardingCheckoutState => {
    // Determine if user is on free tier
    const planName = subscription?.planName?.toLowerCase() ?? '';
    const isFreeTier = planName.includes('free') || planName === 'freeflow' || planName === 'free-flow';

    // Check if user has a pending paid plan selection (from registration flow)
    // This takes priority - if they selected a paid plan, they need to complete payment
    const pendingPlanId = typeof window !== 'undefined' ? localStorage.getItem('pendingPlanId') : null;
    const pendingBillingInterval = (typeof window !== 'undefined'
      ? localStorage.getItem('pendingBillingInterval') as BillingInterval
      : 'monthly') || 'monthly';
    const pendingIncludeOnboarding = typeof window !== 'undefined'
      ? localStorage.getItem('pendingIncludeOnboarding') === 'true'
      : false;
    // Normalize plan ID: remove dashes and lowercase for comparison
    const normalizedPendingPlanId = pendingPlanId?.toLowerCase().replace(/-/g, '') || null;
    const hasPendingPaidPlan = normalizedPendingPlanId !== null && normalizedPendingPlanId !== 'freeflow';

    // Debug logging
    console.log('[useOnboardingCheckout] getCheckoutState:', {
      pendingPlanId,
      hasPendingPaidPlan,
      planName,
      isFreeTier,
      subscriptionStatus: subscription?.status,
    });

    // Check subscription status
    // Valid statuses: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
    const status = subscription?.status;
    const isOnTrial = status === 'trialing';
    const isActive = status === 'active';
    const isPastDue = status === 'past_due';
    const isUnpaid = status === 'unpaid';
    const isCanceled = status === 'canceled';

    // User has a valid paid subscription (active and not free tier)
    const hasPaidSubscription = isActive && !isFreeTier;

    // Checkout is required if:
    // 1. User has a pending paid plan (selected during registration but not paid) - HIGHEST PRIORITY
    // 2. User is on free tier and might want to upgrade
    // 3. User has no subscription
    // 4. Subscription is canceled/past_due/unpaid
    const requiresCheckout = hasPendingPaidPlan ||
      (!subscription) ||
      isFreeTier ||
      isPastDue ||
      isUnpaid ||
      isCanceled;

    // Payment was verified successfully
    // Check both: 1) Fresh verification from this hook, OR 2) Already verified by success page
    const alreadyVerifiedBySuccessPage = typeof window !== 'undefined' &&
      sessionStorage.getItem('paymentConfirmed') === 'true';
    const freshlyVerified = checkoutSuccess &&
      verifyCheckoutQuery.isSuccess &&
      verifyCheckoutQuery.data?.status === 'complete';
    const paymentVerified = freshlyVerified || (checkoutSuccess && alreadyVerifiedBySuccessPage);

    // User is on trial of free plan (genuine trial, not waiting for paid plan payment)
    const isGenuineFreeTrial = isOnTrial && !hasPendingPaidPlan && isFreeTier;

    return {
      // Require checkout if:
      // - User has a pending paid plan from registration (MUST pay), OR
      // - User doesn't have a paid subscription and is not on genuine free trial
      requiresCheckout: hasPendingPaidPlan || (requiresCheckout && !hasPaidSubscription && !isGenuineFreeTrial),
      isOnTrial,
      isFreeTier,
      paymentCompleted: paymentVerified,
      // Not loading if we already have confirmation from success page
      isLoading: alreadyVerifiedBySuccessPage ? false : (isLoadingSubscription || verifyCheckoutQuery.isLoading),
      pendingPlanId,
      pendingBillingInterval,
      pendingIncludeOnboarding,
    };
  };

  /**
   * Start checkout flow for a specific plan
   */
  const startCheckout = (
    planId: string,
    billingInterval: BillingInterval = 'monthly',
    includeOnboardingSupport = false
  ) => {
    console.log('[useOnboardingCheckout] startCheckout called:', {
      planId,
      billingInterval,
      includeOnboardingSupport,
    });
    createCheckoutMutation.mutate({ planId, billingInterval, includeOnboardingSupport });
  };

  /**
   * Skip payment and continue with free tier
   */
  const skipPayment = () => {
    router.push('/dashboard');
  };

  // Get full subscription status for monitoring
  const subscriptionStatus = subscription?.status;
  const subscriptionPlanName = subscription?.planName;

  return {
    ...getCheckoutState(),
    checkoutCancelled,
    startCheckout,
    skipPayment,
    completeWithPayment: completeWithPaymentMutation.mutate,
    completeWithPaymentAsync: completeWithPaymentMutation.mutateAsync,
    completeWithFreeTier: completeWithFreeTierMutation.mutate,
    completeWithFreeTierAsync: completeWithFreeTierMutation.mutateAsync,
    isCheckoutPending: createCheckoutMutation.isPending,
    isCompletingPayment: completeWithPaymentMutation.isPending,
    isCompletingFreeTier: completeWithFreeTierMutation.isPending,
    checkoutError: createCheckoutMutation.error,
    verifyCheckoutQuery,
    // Subscription monitoring
    subscription,
    subscriptionStatus,
    subscriptionPlanName,
  };
}


/**
 * Registration hook
 * Handles user registration with business creation
 * Supports optional plan selection for direct subscription
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient, handleApiError } from '@/lib/axios';
import { getApiUrl } from '@/lib/config';
import { RegisterFormData } from '@/lib/validations/auth';
import { RegisterResponse } from '@/types/auth';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { trackEvent, identifyUser } from '@/lib/posthog';
import type { BillingInterval } from '@/types/api';

interface RegisterOptions {
  /** Plan ID to subscribe to after registration */
  planId?: string;
  /** Billing interval for the plan */
  billingInterval?: BillingInterval;
  /** Whether to include optional onboarding in billing */
  includeOnboarding?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useRegister = (options?: RegisterOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      // Normalize plan ID to plan name (e.g., 'smart-flow' -> 'smartflow')
      const selectedPlan = options?.planId?.replace(/-/g, '') || 'freeflow';

      try {
        const response = await apiClient.post<RegisterResponse>(
          getApiUrl('auth/register'),
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            acceptTerms: data.acceptTerms,
            businessName: data.companyName,
            phoneNumber: data.phoneNumber,
            selectedPlan: selectedPlan,
          }
        );
        // devBypass interceptor returns { data: null } when backend is unreachable
        if (!response.data) {
          console.warn('[useRegister] Backend unreachable — bypassing registration for dev');
          if (typeof window !== 'undefined') sessionStorage.setItem('devBypass', 'true');
          return null as unknown as RegisterResponse;
        }
        return response.data;
      } catch {
        console.warn('[useRegister] Network error — bypassing registration for dev');
        if (typeof window !== 'undefined') sessionStorage.setItem('devBypass', 'true');
        return null as unknown as RegisterResponse;
      }
    },
    onSuccess: async (data, _variables) => {
      // Dev bypass — backend was unreachable, skip all session/analytics setup
      if (!data) {
        options?.onSuccess?.();
        return;
      }

      const variables = _variables;
      // Store tokens and user data in sessionStorage for the verification flow
      // This allows useAuth.checkSession() to work without NextAuth session
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('refreshToken', data.refreshToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('businessId', data.user.businessId);

      // Store email for verification page
      localStorage.setItem('pendingVerificationEmail', variables.email);

      // Store selected plan for post-login payment flow (for paid plans)
      // Note: planId should now be in database format (e.g., "smartflow", not "smart-flow")
      const normalizedPlanId = options?.planId?.toLowerCase().replace(/-/g, '');
      const isPaidPlan = normalizedPlanId && normalizedPlanId !== 'freeflow';
      console.log('[useRegister] Registration success, plan options:', {
        planId: options?.planId,
        normalizedPlanId,
        billingInterval: options?.billingInterval,
        includeOnboarding: options?.includeOnboarding,
        isPaidPlan,
      });
      
      if (isPaidPlan && options) {
        console.log('[useRegister] Storing pending plan in localStorage:', options.planId);
        localStorage.setItem('pendingPlanId', options.planId!);
        localStorage.setItem('pendingBillingInterval', options.billingInterval || 'monthly');
        localStorage.setItem('pendingIncludeOnboarding', options.includeOnboarding ? 'true' : 'false');
      } else {
        console.log('[useRegister] Free plan selected, clearing pending plan');
        // Clear any existing pending plan for free flow
        localStorage.removeItem('pendingPlanId');
        localStorage.removeItem('pendingBillingInterval');
        localStorage.removeItem('pendingIncludeOnboarding');
      }

      // Track registration event and identify user in PostHog
      identifyUser(data.user.id, {
        email: data.user.email,
        businessId: data.user.businessId,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      });
      trackEvent('user_registered', {
        userId: data.user.id,
        businessId: data.user.businessId,
        hasSelectedPlan: !!options?.planId,
      });

      // Check if email needs verification
      if (!data.user.emailConfirmed) {
        toast.success('Registration successful! Please check your email to verify your account.');
        if (options?.onSuccess) {
          // Let the caller handle navigation
          options.onSuccess();
        } else {
          router.push('/verify-email/pending');
        }
        return;
      }

      // Email already confirmed (rare case) - proceed with payment or onboarding
      toast.success('Registration successful! Welcome to Qualiflow AI.');
      options?.onSuccess?.();

      // If a paid plan was selected, redirect to Stripe checkout before onboarding
      if (isPaidPlan) {
        try {
          trackEvent('subscription_started', {
            planId: options!.planId,
            billingInterval: options!.billingInterval || 'monthly',
            includeOnboarding: options!.includeOnboarding || false,
          });
          const checkoutResponse = await subscriptionsService.createCheckoutSession({
            planId: options!.planId!,
            billingInterval: options!.billingInterval || 'monthly',
            includeOnboarding: options!.includeOnboarding || false,
            successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/register?plan=${options!.planId}&canceled=true`,
          });
          // Clear pending plan since we're redirecting to checkout
          localStorage.removeItem('pendingPlanId');
          localStorage.removeItem('pendingBillingInterval');
          localStorage.removeItem('pendingIncludeOnboarding');
          window.location.href = checkoutResponse.checkoutUrl;
          return;
        } catch {
          // If checkout fails, inform user they need to complete payment
          toast.error('Could not start checkout. Please try again or contact support.');
          router.push('/register?payment_required=true');
          return;
        }
      }

      // Free plan or no plan selected - redirect to onboarding directly
      trackEvent('onboarding_started', {
        userId: data.user.id,
        businessId: data.user.businessId,
      });
      router.push('/onboarding');
    },
    onError: (error: unknown) => {
      const message = handleApiError(error);
      toast.error(message);
      options?.onError?.(message);
    },
  });
};
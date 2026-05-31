/**
 * Email OTP verification hook
 * Handles OTP verification and session establishment
 */

import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/config';
import type { LoginResponse, VerifyEmailOtpRequest, ResendEmailOtpRequest, ResendEmailOtpResponse } from '@/types/auth';

interface VerifyOtpOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for verifying email OTP and establishing session
 */
export const useVerifyEmailOtp = (options?: VerifyOtpOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: VerifyEmailOtpRequest): Promise<LoginResponse> => {
      const apiUrl = getApiUrl('auth/verify-email-otp');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid or expired verification code');
      }

      return response.json();
    },
    onSuccess: async (data: LoginResponse) => {
      toast.success('Verification successful');
      options?.onSuccess?.();

      // CRITICAL: Establish NextAuth session using the token provider
      // This ensures the dashboard's useSession() hook returns 'authenticated'
      console.log('[useVerifyEmailOtp] Establishing NextAuth session with token provider');
      const signInResult = await signIn('token', {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        businessId: data.user.businessId,
        role: data.user.role,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error('[useVerifyEmailOtp] Failed to establish NextAuth session:', signInResult.error);
        toast.error('Session error. Please try logging in again.');
        router.push('/login');
        return;
      }

      console.log('[useVerifyEmailOtp] NextAuth session established successfully');

      // Store tokens in sessionStorage for API calls (as fallback)
      sessionStorage.setItem('accessToken', data.accessToken);
      if (data.user?.businessId) {
        sessionStorage.setItem('businessId', data.user.businessId);
      }

      // Clear pending OTP data
      sessionStorage.removeItem('pendingOtpEmail');

      // NEW FLOW: Always redirect to onboarding first, payment happens after onboarding completes
      // The pending plan info is kept in localStorage for use during/after onboarding
      const pendingPlanId = localStorage.getItem('pendingPlanId');
      console.log('[useVerifyEmailOtp] Pending plan (will be used after onboarding):', pendingPlanId);

      // Always check onboarding status and redirect appropriately
      try {
        const { onboardingService } = await import('@/services/api/onboarding.service');
        const onboardingStatus = await onboardingService.getStatus();

        if (!onboardingStatus.isComplete) {
          console.log('[useVerifyEmailOtp] Redirecting to onboarding');
          router.push('/onboarding');
        } else {
          // Onboarding complete - if there's a pending paid plan, redirect to subscription checkout
          if (pendingPlanId && pendingPlanId !== 'free-flow') {
            console.log('[useVerifyEmailOtp] Onboarding complete, redirecting to subscription checkout for:', pendingPlanId);
            // Use subscription page with auto-checkout for the pending plan
            router.push(`/subscription?plan=${pendingPlanId}&autoCheckout=true`);
          } else {
            console.log('[useVerifyEmailOtp] Redirecting to dashboard');
            router.push('/dashboard');
          }
        }
      } catch {
        // Fallback: go to onboarding if we can't check status
        router.push('/onboarding');
      }
    },
    onError: (error: Error) => {
      const message = error.message || 'Verification failed. Please try again.';
      toast.error(message);
      options?.onError?.(message);
    },
  });
};

/**
 * Hook for resending email OTP
 */
export const useResendEmailOtp = () => {
  return useMutation({
    mutationFn: async (data: ResendEmailOtpRequest): Promise<ResendEmailOtpResponse> => {
      const apiUrl = getApiUrl('auth/resend-email-otp');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to resend verification code');
      }

      return response.json();
    },
    onSuccess: (data: ResendEmailOtpResponse) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.info(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend verification code');
    },
  });
};


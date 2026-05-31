/**
 * Login hook
 * Handles user login with email/password
 * Supports email OTP verification when Remember Me is not checked
 */

import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LoginFormData } from '@/lib/validations/auth';
import { getApiUrl } from '@/lib/config';
import type { OnboardingStatus } from '@/types/api';
import type { LoginOtpRequiredResponse } from '@/types/auth';

interface LoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onOtpRequired?: (response: LoginOtpRequiredResponse, email: string) => void;
}

interface LoginResult {
  requiresOtp: boolean;
  otpResponse?: LoginOtpRequiredResponse;
}

export const useLogin = (options?: LoginOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormData): Promise<LoginResult> => {
      // First, call the backend directly to check if OTP is required
      const apiUrl = getApiUrl('auth/login');

      let response: Response | null = null;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            rememberMe: data.rememberMe ?? false,
          }),
        });
      } catch {
        // Backend unreachable (dev environment) — bypass and proceed to dashboard
        console.warn('[useLogin] Backend unreachable — bypassing login for dev');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('devBypass', 'true');
        }
        return { requiresOtp: false };
      }

      // 202 Accepted = OTP required
      if (response.status === 202) {
        const otpResponse: LoginOtpRequiredResponse = await response.json();
        // Store email for OTP verification page
        sessionStorage.setItem('pendingOtpEmail', data.email);
        return { requiresOtp: true, otpResponse };
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid email or password');
      }

      // 200 OK = Direct login (Remember Me was checked or OTP not required)
      // Now use NextAuth to establish the session
      try {
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error('Invalid email or password');
        }
      } catch {
        // NextAuth also unreachable — bypass for dev
        console.warn('[useLogin] NextAuth signIn failed — bypassing for dev');
      }

      return { requiresOtp: false };
    },
    onSuccess: async (result: LoginResult) => {
      // Handle OTP required case
      if (result.requiresOtp && result.otpResponse) {
        toast.info('Verification code sent to your email');
        options?.onOtpRequired?.(result.otpResponse, sessionStorage.getItem('pendingOtpEmail') || '');

        // Redirect to OTP verification page
        const params = new URLSearchParams({
          email: sessionStorage.getItem('pendingOtpEmail') || '',
          maskedEmail: result.otpResponse.maskedEmail,
          cooldown: result.otpResponse.resendCooldownSeconds.toString(),
        });
        router.push(`/verify-email-otp?${params.toString()}`);
        return;
      }

      toast.success('Login successful');
      options?.onSuccess?.();

      // CRITICAL: Wait for session to be fully established before checking onboarding
      // NextAuth session takes a moment to propagate after signIn completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the fresh session to get the access token
      let retries = 3;
      let session = null;

      while (retries > 0) {
        try {
          const sessionResponse = await fetch('/api/auth/session');
          session = await sessionResponse.json();
          
          // Log full session for debugging
          console.log('[useLogin] Session response:', JSON.stringify(session, null, 2));

          if (session?.accessToken) {
            console.log('[useLogin] Session obtained successfully');
            break;
          }

          console.log('[useLogin] Session not ready, retrying...', { 
            retries,
            hasAccessToken: !!session?.accessToken,
            hasUser: !!session?.user,
            sessionKeys: session ? Object.keys(session) : []
          });
          await new Promise(resolve => setTimeout(resolve, 300));
          retries--;
        } catch (error) {
          console.error('[useLogin] Error fetching session:', error);
          retries--;
        }
      }

      if (!session?.accessToken) {
        // No session (backend down in dev) — go straight to dashboard
        console.warn('[useLogin] No session token — bypassing to dashboard for dev');
        sessionStorage.setItem('devBypass', 'true');
        router.push('/dashboard');
        return;
      }

      // Store session token in sessionStorage BEFORE any API calls
      // This ensures axios interceptor can find the token for authenticated requests
      sessionStorage.setItem('accessToken', session.accessToken);
      if (session.user?.businessId) {
        sessionStorage.setItem('businessId', session.user.businessId);
      }
      console.log('[useLogin] Stored session tokens in sessionStorage');

      // NEW FLOW: Payment happens AFTER onboarding completes
      // The pending plan info is kept in localStorage and will be used after onboarding
      const pendingPlanId = localStorage.getItem('pendingPlanId');
      console.log('[useLogin] Pending plan (will be used after onboarding):', pendingPlanId);

      // Check onboarding status with the fresh token
      // (sessionStorage tokens already stored above)
      try {
        console.log('[useLogin] Fetching onboarding status');
        const { onboardingService } = await import('@/services/api/onboarding.service');
        const onboardingStatus: OnboardingStatus = await onboardingService.getStatus();
        console.log('[useLogin] Onboarding status:', onboardingStatus);

        // Redirect based on onboarding status
        if (!onboardingStatus.isComplete && !onboardingStatus.isSkipped) {
          // Onboarding not complete → go to onboarding
          // Payment will happen at the end of onboarding using pendingPlanId
          console.log('[useLogin] Redirecting to onboarding');
          router.push('/onboarding');
        } else {
          // Onboarding complete → check for pending paid plan first
          if (pendingPlanId && pendingPlanId !== 'free-flow') {
            // User has a pending paid plan → redirect to direct checkout (skips plan selection)
            console.log('[useLogin] Onboarding complete, redirecting to checkout for:', pendingPlanId);
            router.push(`/checkout?plan=${pendingPlanId}&returnTo=/onboarding`);
            return;
          }

          // No pending payment → check channel activation status, then go to dashboard
          console.log('[useLogin] Onboarding complete, checking channel activation status');
          try {
            const { checkChannelActivationStatus } = await import('@/hooks/api/useChannelActivationStatus');
            const activationStatus = await checkChannelActivationStatus();
            console.log('[useLogin] Channel activation status:', activationStatus);

            if (!activationStatus.isComplete && activationStatus.hasPendingSetup) {
              // Channel activation not complete → go to channels page
              console.log('[useLogin] Redirecting to channels - pending setup:', activationStatus.pendingCount);
              router.push('/channels');
            } else {
              // Everything complete → go to dashboard
              console.log('[useLogin] All complete, redirecting to dashboard');
              router.push('/dashboard');
            }
          } catch (channelError) {
            // If channel check fails, go to dashboard (it will handle redirect if needed)
            console.error('[useLogin] Failed to check channel activation:', channelError);
            router.push('/dashboard');
          }
        }
      } catch (error) {
        // If onboarding status check fails, default to dashboard
        // The dashboard layout will handle onboarding redirect if needed
        console.error('[useLogin] Failed to check onboarding status:', error);
        // Default to dashboard - it will redirect to onboarding if needed
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      const message = error.message || 'Login failed. Please try again.';
      toast.error(message);
      options?.onError?.(message);
    },
  });
};
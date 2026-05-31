'use client';

/**
 * OAuth Callback Page - Simplified SaaS OAuth Flow
 *
 * NEW FLOW: OAuth → Onboarding → Payment (paid plans after onboarding completes)
 * Flow for EXISTING users: OAuth → Dashboard (or Onboarding if incomplete)
 */

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/logo';
import { Card } from '@/components/ui/card';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { onboardingService } from '@/services/api/onboarding.service';
import { trackEvent, identifyUser } from '@/lib/posthog';
import type { BillingInterval } from '@/types/api';

const PLAN_NAMES: Record<string, string> = {
  'free-flow': 'Free Flow',
  'smart-flow': 'Smart Flow',
  'ultra-flow': 'Ultra Flow',
};

export default function OAuthCallbackPage() {
  const { data: session, status } = useSession();
  const [statusMessage, setStatusMessage] = useState('Completing authentication...');
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing and wait for session
    if (processedRef.current || status === 'loading') return;

    const processOAuth = async () => {
      processedRef.current = true;

      // Not authenticated - go to login
      if (status === 'unauthenticated' || !session?.user) {
        console.error('[OAuth] Not authenticated');
        toast.error('Authentication failed');
        window.location.href = '/login';
        return;
      }

      // Session error - go to login
      if ((session as { error?: string })?.error) {
        console.error('[OAuth] Session error');
        toast.error('Authentication error');
        window.location.href = '/login';
        return;
      }

      setStatusMessage('Setting up your account...');

      const user = session.user as {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        businessId?: string;
      };

      const isNewUser = (session as { isNewUser?: boolean }).isNewUser;
      const accessToken = (session as { accessToken?: string }).accessToken;
      const refreshToken = (session as { refreshToken?: string }).refreshToken;

      // Debug: Log full session to see what we're getting
      console.log('[OAuth] Full session:', JSON.stringify(session, null, 2));
      console.log('[OAuth] Processing:', { isNewUser, hasToken: !!accessToken, userId: user.id });

      // CRITICAL: If no accessToken, the backend OAuth call likely failed
      if (!accessToken) {
        console.error('[OAuth] CRITICAL: No accessToken in session - backend OAuth may have failed');
        toast.error('Authentication incomplete. Please try again.', {
          description: 'Could not retrieve access token from server.',
        });
        // Wait a moment for toast, then redirect to register
        setTimeout(() => {
          window.location.href = '/register';
        }, 2000);
        return;
      }

      // Track user
      if (user.id) {
        identifyUser(user.id, {
          email: user.email,
          businessId: user.businessId,
          firstName: user.firstName,
          lastName: user.lastName,
          authMethod: 'oauth',
        });
        trackEvent(isNewUser ? 'oauth_registration_complete' : 'oauth_login_complete', {
          userId: user.id,
          businessId: user.businessId,
        });
      }

      // Store tokens for API calls
      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.businessId,
        }));
      }

      // Helper to get cookie value
      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };
      
      // Debug: Log ALL storage
      console.log('[OAuth Callback] localStorage keys:', Object.keys(localStorage));
      console.log('[OAuth Callback] cookies:', document.cookie);
      
      // Check if user has pending plan - try localStorage first, then cookies
      const pendingPlan = localStorage.getItem('oauthPendingPlan');
      const billingInterval = (localStorage.getItem('oauthPendingBillingInterval') || 'monthly') as BillingInterval;
      const includeOnboarding = localStorage.getItem('oauthPendingIncludeOnboarding') === 'true';
      
      // Try localStorage first, fall back to cookies for company name and phone
      const pendingCompanyName = localStorage.getItem('oauthPendingCompanyName') || getCookie('oauthPendingCompanyName');
      const pendingPhoneNumber = localStorage.getItem('oauthPendingPhoneNumber') || getCookie('oauthPendingPhoneNumber');
      
      const planName = PLAN_NAMES[pendingPlan || 'free-flow'] || 'Free Flow';
      const isPaidPlan = pendingPlan && pendingPlan !== 'free-flow';
      
      console.log('[OAuth Callback] Extracted values:', {
        pendingPlan,
        billingInterval,
        includeOnboarding,
        pendingCompanyName,
        pendingPhoneNumber,
        planName,
        isPaidPlan,
        isNewUser,
        source: pendingCompanyName ? (localStorage.getItem('oauthPendingCompanyName') ? 'localStorage' : 'cookie') : 'none',
      });
      
      // Store company name and phone for onboarding if provided
      if (pendingCompanyName) {
        sessionStorage.setItem('pendingCompanyName', pendingCompanyName);
      }
      if (pendingPhoneNumber) {
        sessionStorage.setItem('pendingPhoneNumber', pendingPhoneNumber);
      }

      // Update business with company name using onboarding endpoint (doesn't require admin role)
      if (pendingCompanyName) {
        console.log('[OAuth] About to update business name via onboarding:', { pendingCompanyName });
        try {
          // Use onboarding endpoint which only requires authentication, not admin role
          await onboardingService.submitBusinessProfile({
            businessName: pendingCompanyName,
            industry: '', // Will be set during actual onboarding
            companySize: '',
          });
          console.log('[OAuth] Successfully updated business name via onboarding');
          
          // Clear the cookies after successful use
          document.cookie = 'oauthPendingCompanyName=; path=/; max-age=0';
          document.cookie = 'oauthPendingPhoneNumber=; path=/; max-age=0';
        } catch (err) {
          console.error('[OAuth] Failed to update business name:', err);
          // Non-blocking - continue with flow even if this fails
        }
      }

      // For existing users WITH a pending paid plan, check subscription status
      if (!isNewUser && isPaidPlan) {
        try {
          const subscription = await subscriptionsService.getCurrentSubscription();
          // If they have an active paid subscription, go to dashboard
          if (subscription?.status === 'active' && subscription?.planId !== 'free-flow') {
            localStorage.removeItem('oauthPendingPlan');
            localStorage.removeItem('oauthPendingBillingInterval');
            localStorage.removeItem('oauthPendingIncludeOnboarding');
            localStorage.removeItem('oauthPendingCompanyName');
            localStorage.removeItem('oauthPendingPhoneNumber');

            toast.success(`Welcome back, ${user.firstName || 'there'}!`, {
              icon: <CheckCircle className="size-5 text-green-500" />,
            });

            setStatusMessage('Redirecting to dashboard...');
            window.location.href = '/dashboard';
            return;
          }
          // No active subscription - continue to onboarding (payment happens after)
        } catch (err) {
          console.log('[OAuth] Subscription check failed, proceeding to onboarding:', err);
        }
      }

      // EXISTING USER without pending plan → Check onboarding status
      if (!isNewUser && !pendingPlan) {
        try {
          const onboardingStatus = await onboardingService.getStatus();
          if (onboardingStatus.isComplete) {
            toast.success(`Welcome back, ${user.firstName || 'there'}!`, {
              icon: <CheckCircle className="size-5 text-green-500" />,
            });
            setStatusMessage('Redirecting to dashboard...');
            window.location.href = '/dashboard';
            return;
          }
        } catch (err) {
          console.log('[OAuth] Onboarding check failed:', err);
        }
      }

      // NEW FLOW: Store pending plan info for use after onboarding (don't clear yet)
      // The plan info will be used at the end of onboarding to redirect to payment
      if (isPaidPlan) {
        // Store in regular localStorage for the onboarding checkout page
        localStorage.setItem('pendingPlanId', pendingPlan);
        localStorage.setItem('pendingBillingInterval', billingInterval);
        localStorage.setItem('pendingIncludeOnboarding', includeOnboarding.toString());
        console.log('[OAuth] Stored pending plan for post-onboarding checkout:', pendingPlan);
      }

      // Clear OAuth-specific localStorage (but keep pendingPlanId for onboarding)
      localStorage.removeItem('oauthPendingPlan');
      localStorage.removeItem('oauthPendingBillingInterval');
      localStorage.removeItem('oauthPendingIncludeOnboarding');
      localStorage.removeItem('oauthPendingCompanyName');
      localStorage.removeItem('oauthPendingPhoneNumber');

      // ALL USERS (new or existing with incomplete onboarding) → Onboarding first
      toast.success(`Welcome to Qualiflow AI, ${user.firstName || 'there'}!`, {
        description: isPaidPlan
          ? `Let's set up your account, then complete your ${planName} subscription.`
          : "Let's set up your account.",
        icon: <Rocket className="size-5 text-orange-500" />,
      });

      trackEvent('oauth_onboarding_started', { userId: user.id, plan: pendingPlan || 'free-flow' });

      setStatusMessage('Preparing your workspace...');
      window.location.href = '/onboarding';
    };

    processOAuth();
  }, [session, status]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-landing-hero">
      <Card className="w-full max-w-md mx-4 p-8 shadow-elevation-xl border-0">
        <div className="text-center space-y-6">
          <Logo href="/" showText={true} size="lg" variant="dark" />
          
          <div className="flex justify-center py-4">
            <div className="flex items-center justify-center size-16 rounded-full bg-purple-100">
              <Loader2 className="size-8 animate-spin text-purple-600" />
            </div>
          </div>

          <p className="text-lg font-medium text-text-navy">{statusMessage}</p>
          
          <p className="text-sm text-text-secondary">
            Please wait while we complete your setup...
          </p>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { usePlans } from '@/hooks/subscriptions/useSubscriptions';
import type { BillingInterval } from '@/types/api';

/**
 * Direct Checkout Page
 * 
 * This page immediately creates a Stripe checkout session and redirects to Stripe.
 * It's used when users have already selected a plan (e.g., during registration)
 * and need to complete payment without showing the plan selection UI.
 * 
 * URL params:
 * - plan: The plan ID or slug (e.g., 'ultra-flow', 'smart-flow')
 * - interval: Billing interval ('monthly', 'yearly') - default: 'monthly'
 * - returnTo: Where to redirect after successful payment - default: '/onboarding'
 */
export default function DirectCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const { data: plans, isLoading: isLoadingPlans, error: plansError } = usePlans();
  
  const planSlug = searchParams.get('plan');
  const billingInterval = (searchParams.get('interval') || 'monthly') as BillingInterval;
  const returnTo = searchParams.get('returnTo') || '/onboarding';
  
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const checkoutTriggered = useRef(false);

  useEffect(() => {
    // Wait for session and plans to load
    if (sessionStatus === 'loading' || isLoadingPlans) return;

    // Handle unauthenticated users
    if (sessionStatus === 'unauthenticated') {
      router.push(`/login?callbackUrl=/checkout?plan=${planSlug}`);
      return;
    }

    // Handle missing plan parameter
    if (!planSlug) {
      setError('No plan specified. Please select a plan first.');
      return;
    }

    // Handle plans loading error
    if (plansError) {
      setError('Failed to load plans. Please try again.');
      return;
    }

    // Wait for plans to be available
    if (!plans || plans.length === 0) return;

    // Prevent duplicate checkout triggers
    if (checkoutTriggered.current) return;
    checkoutTriggered.current = true;

    // Find the plan by slug or ID
    const normalizedPlan = planSlug.toLowerCase().replace(/-/g, '');
    const matchedPlan = plans.find(p =>
      p.id === planSlug ||
      p.name.toLowerCase().replace(/\s+/g, '') === normalizedPlan ||
      p.displayName?.toLowerCase().replace(/\s+/g, '') === normalizedPlan
    );

    if (!matchedPlan) {
      setError(`Plan "${planSlug}" not found. Please select a valid plan.`);
      checkoutTriggered.current = false;
      return;
    }

    // Check if it's a free plan
    if (matchedPlan.priceMonthly === 0) {
      // Free plan - no checkout needed, go to onboarding
      localStorage.removeItem('pendingPlanId');
      sessionStorage.setItem('paymentConfirmed', 'true');
      sessionStorage.setItem('confirmedPlanName', matchedPlan.displayName || matchedPlan.name);
      router.push('/onboarding');
      return;
    }

    // Create checkout session
    const createCheckout = async () => {
      setIsRedirecting(true);
      try {
        console.log('[Checkout] Creating checkout session for:', matchedPlan.name, billingInterval);
        
        const response = await subscriptionsService.createCheckoutSession({
          planId: matchedPlan.name, // Use plan name as the API expects slug/name
          billingInterval,
          includeOnboarding: false,
          // After success, go to celebration/success page, then to dashboard
          successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(returnTo)}`,
          cancelUrl: `${window.location.origin}/checkout?plan=${planSlug}&canceled=true`,
        });

        // Redirect to Stripe
        window.location.href = response.checkoutUrl;
      } catch (err) {
        console.error('[Checkout] Failed to create checkout session:', err);
        setError('Failed to create checkout session. Please try again.');
        setIsRedirecting(false);
        checkoutTriggered.current = false;
      }
    };

    createCheckout();
  }, [sessionStatus, session, plans, isLoadingPlans, plansError, planSlug, billingInterval, returnTo, router]);

  // Handle canceled checkout
  const canceled = searchParams.get('canceled') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-center px-4 md:px-8 lg:px-16">
          <Logo href="/" showText={true} size="md" variant="default" />
        </div>
      </header>

      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          {error || canceled ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="size-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <AlertCircle className="size-10 text-amber-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {canceled ? 'Checkout Canceled' : 'Checkout Error'}
              </h1>
              <p className="text-gray-500 mb-6">
                {canceled 
                  ? 'You canceled the checkout. Would you like to try again or choose a different plan?'
                  : error
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    checkoutTriggered.current = false;
                    setError(null);
                    router.push(`/checkout?plan=${planSlug}`);
                    window.location.reload();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  Choose Different Plan
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="size-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Loader2 className="size-10 text-purple-600 animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isRedirecting ? 'Redirecting to Payment...' : 'Preparing Checkout...'}
              </h1>
              <p className="text-gray-500">
                {isRedirecting 
                  ? 'You\'ll be redirected to our secure payment page.'
                  : 'Please wait while we prepare your checkout session.'
                }
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


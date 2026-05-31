'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  XCircle,
  Receipt,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/posthog';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { subscriptionKeys } from '@/hooks/subscriptions/useSubscriptions';
import type { CheckoutSessionDetails } from '@/types/api';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<CheckoutSessionDetails | null>(null);
  const [displayBusinessName, setDisplayBusinessName] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast.error('Invalid session. Please try again.');
        // Redirect to pricing page instead of register to avoid loops
        // User can select a plan and complete checkout from there
        router.push('/pricing');
        return;
      }

      try {
        const details = await subscriptionsService.verifyCheckoutSession(sessionId);
        setSessionDetails(details);
        setIsSuccess(details.status === 'complete' && details.paymentStatus === 'paid');
        setIsVerifying(false);
        
        // Use company name from sessionStorage (set during OAuth) if available
        // This overrides the default "gmail.com (OAuth)" name from backend
        const pendingCompanyName = sessionStorage.getItem('pendingCompanyName');
        if (pendingCompanyName) {
          setDisplayBusinessName(pendingCompanyName);
        } else {
          setDisplayBusinessName(details.businessName || null);
        }

        if (details.status === 'complete' && details.paymentStatus === 'paid') {
          // Mark payment as confirmed so onboarding page allows access
          sessionStorage.setItem('paymentConfirmed', 'true');
          // Store the confirmed plan name for the subscription banner to use
          // This is needed because the webhook may not have processed yet
          // Use planDisplayName (e.g., "Smart Flow") or fall back to planName (e.g., "smartflow")
          sessionStorage.setItem('confirmedPlanName', details.planDisplayName || details.planName || '');
          // Clear pending plan since payment is complete
          localStorage.removeItem('pendingPlanId');
          localStorage.removeItem('pendingBillingInterval');
          localStorage.removeItem('pendingIncludeOnboarding');

          trackEvent('payment_success', {
            sessionId,
            planName: details.planName,
            amount: details.amountTotal,
            billingInterval: details.billingInterval,
          });

          console.log('[SubscriptionSuccess] Payment verified successfully, triggering welcome email...');

          // IMPORTANT: Trigger welcome email immediately after payment verification
          // This ensures the email is sent even if user doesn't click Continue or navigates away
          try {
            const { apiClient } = await import('@/lib/axios');
            await apiClient.post('/onboarding/complete-with-payment');
            console.log('[SubscriptionSuccess] Welcome email triggered successfully after payment verification');
            trackEvent('welcome_email_triggered_on_verification');
          } catch (emailError) {
            // Non-blocking - log but don't prevent user flow
            console.error('[SubscriptionSuccess] Failed to trigger welcome email on verification:', emailError);
          }

          // User will click Continue button to proceed to celebration page
          // No auto-redirect - let user see the payment confirmation
        }
      } catch {
        toast.error('Could not verify payment. Please contact support.');
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, router]);

  const handleContinue = async () => {
    // Invalidate subscription cache so dashboard/onboarding fetches fresh data
    await queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });

    trackEvent('payment_success_continue_clicked');

    // Note: Welcome email is already triggered during payment verification (above)
    // No need to trigger again here - just proceed with navigation

    // Make sure paymentConfirmed is set for the celebration page
    sessionStorage.setItem('paymentConfirmed', 'true');

    // Redirect to onboarding with checkout_success flag - this shows celebration
    router.push('/onboarding?checkout_success=true&session_id=' + sessionId);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getBillingIntervalLabel = (interval: string) => {
    switch (interval.toLowerCase()) {
      case 'yearly':
      case 'annual':
        return 'Yearly';
      case 'quarterly':
        return 'Quarterly';
      default:
        return 'Monthly';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-center px-4 md:px-8 lg:px-16">
          <Logo href="/" showText={true} size="md" variant="default" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative min-h-screen flex items-center pt-16">
        {/* Background - matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 md:px-8 lg:px-16 py-6">
          {isVerifying ? (
            /* Loading State */
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                <div className="flex justify-center mb-6">
                  <div className="size-20 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Loader2 className="size-10 text-purple-600 animate-spin" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Payment...
                </h1>
                <p className="text-gray-500">
                  Please wait while we confirm your payment.
                </p>
              </div>
            </div>
          ) : isSuccess && sessionDetails ? (
            /* Success State */
            <div className="max-w-2xl mx-auto">
              {/* Success Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="size-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h1>
                <p className="text-base text-gray-600">
                  Welcome to Qualiflow AI. Your subscription is now active.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-5">
                {/* Plan Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {sessionDetails.planDisplayName || sessionDetails.planName}
                      </h2>
                      <p className="text-white/80">
                        {getBillingIntervalLabel(sessionDetails.billingInterval)} Subscription
                        {displayBusinessName && ` for ${displayBusinessName}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-5 space-y-5">
                  {/* Payment Summary */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Receipt className="size-4" />
                      Order Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-2">
                          <CreditCard className="size-4 text-gray-400" />
                          Subscription
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(
                            sessionDetails.includeOnboarding && sessionDetails.onboardingAmount
                              ? sessionDetails.amountTotal - sessionDetails.onboardingAmount
                              : sessionDetails.amountTotal,
                            sessionDetails.currency
                          )}
                        </span>
                      </div>
                      {sessionDetails.includeOnboarding && sessionDetails.onboardingAmount && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center gap-2">
                            <Zap className="size-4 text-gray-400" />
                            Professional Onboarding
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(sessionDetails.onboardingAmount, sessionDetails.currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">Total Paid</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatCurrency(sessionDetails.amountTotal, sessionDetails.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="size-4" />
                        <span className="text-sm">Billing Started</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(sessionDetails.subscriptionStart)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock className="size-4" />
                        <span className="text-sm">Next Billing</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(sessionDetails.subscriptionEnd)}
                      </p>
                    </div>
                  </div>

                  {/* Features Included */}
                  {sessionDetails.features.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Features Included
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {sessionDetails.features.slice(0, 6).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <Check className="size-4 text-emerald-500 flex-shrink-0" />
                            <span className="truncate">{feature}</span>
                          </div>
                        ))}
                        {sessionDetails.features.length > 6 && (
                          <div className="text-gray-500 text-sm col-span-2">
                            +{sessionDetails.features.length - 6} more features
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleContinue}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-pink-600 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
              >
                Continue
                <ArrowRight className="size-5" />
              </button>

              {/* Help Text */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Need help?{' '}
                <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                  Contact support
                </Link>
              </p>
            </div>
          ) : (
            /* Error/Failed Payment State */
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Error Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-center">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-white/20 mb-4">
                    <XCircle className="size-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Payment Could Not Be Verified
                  </h1>
                  <p className="text-white/80 text-sm">
                    Don&apos;t worry - you can still get started with Qualiflow AI
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <p className="text-gray-600 text-center mb-6">
                    We couldn&apos;t verify your payment at this time. If you were charged, please contact our support team for assistance.
                  </p>

                  {/* Options */}
                  <div className="space-y-4">
                    {/* Retry Payment Option */}
                    <button
                      onClick={() => router.push('/register')}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      <CreditCard className="size-5" />
                      Try Payment Again
                    </button>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Free Flow Option */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 size-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          <Sparkles className="size-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            Start with Free Flow
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Get started immediately with our free plan. You can upgrade anytime from your dashboard.
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1 mb-4">
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-emerald-500" />
                              50 leads per month
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-emerald-500" />
                              Basic AI qualification
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-emerald-500" />
                              14-day trial of premium features
                            </li>
                          </ul>
                          <button
                            onClick={() => {
                              // Clear any pending plan data
                              localStorage.removeItem('pendingPlanId');
                              localStorage.removeItem('pendingBillingInterval');
                              localStorage.removeItem('pendingIncludeOnboarding');
                              // Mark as confirmed (free plan doesn't need payment)
                              sessionStorage.setItem('paymentConfirmed', 'true');
                              sessionStorage.setItem('confirmedPlanName', 'Free Flow');
                              router.push('/onboarding');
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            Continue with Free Flow
                            <ArrowRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support Link */}
                  <p className="text-center text-gray-500 text-sm mt-6">
                    Need help?{' '}
                    <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                      Contact support
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

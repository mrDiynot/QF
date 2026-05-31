'use client';

/**
 * Plan Selection Page
 * Displayed during registration flow for users to choose their subscription plan
 *
 * Query Parameters:
 * - returnTo: URL to redirect after plan selection (default: /onboarding)
 * - plan: Pre-selected plan ID (e.g., ultra-flow, smart-flow)
 * - checkout: If 'true', auto-triggers checkout for the pre-selected plan
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePlans, useCreateCheckout } from '@/hooks/subscriptions/useSubscriptions';
import type { BillingInterval, SubscriptionPlan } from '@/types/api';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  freeflow: <Sparkles className="size-6" />,
  smartflow: <Zap className="size-6" />,
  ultraflow: <Crown className="size-6" />,
  enterprise: <Building2 className="size-6" />,
};

const PLAN_COLORS: Record<string, string> = {
  freeflow: 'from-gray-500 to-gray-600',
  smartflow: 'from-purple-500 to-indigo-600',
  ultraflow: 'from-orange-500 to-pink-600',
  enterprise: 'from-slate-700 to-slate-900',
};

export default function PlanSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/onboarding';
  const preselectedPlan = searchParams.get('plan');
  const autoCheckout = searchParams.get('checkout') === 'true';

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const autoCheckoutTriggered = useRef(false);

  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const createCheckout = useCreateCheckout();

  // Auto-select plan from URL query parameter
  useEffect(() => {
    if (preselectedPlan && plans && !selectedPlan) {
      // Try to find plan by ID or name (handle both 'ultra-flow' and 'ultraflow' formats)
      const normalizedPlan = preselectedPlan.toLowerCase().replace(/-/g, '');
      const matchedPlan = plans.find((p: SubscriptionPlan) =>
        p.id === preselectedPlan ||
        p.name.toLowerCase().replace(/\s+/g, '') === normalizedPlan
      );
      if (matchedPlan) {
        setSelectedPlan(matchedPlan.id);
        console.log('[Subscription] Auto-selected plan from URL:', matchedPlan.id);
      }
    }
  }, [preselectedPlan, plans, selectedPlan]);

  // Auto-trigger checkout if checkout=true and plan is selected
  useEffect(() => {
    if (autoCheckout && selectedPlan && plans && !autoCheckoutTriggered.current) {
      const plan = plans.find((p: SubscriptionPlan) => p.id === selectedPlan);
      if (plan && plan.priceMonthly > 0) {
        console.log('[Subscription] Auto-triggering checkout for:', selectedPlan);
        autoCheckoutTriggered.current = true;
        // NOTE: Don't clear pendingPlanId here - it should only be cleared after SUCCESSFUL payment
        // If user cancels checkout, they'll be redirected back and should still see their pending plan
        // The success page will clear the pending plan after payment is confirmed
        // Trigger checkout
        createCheckout.mutate({
          planId: selectedPlan,
          billingInterval,
          successUrl: `${window.location.origin}/subscription/success?returnTo=${encodeURIComponent(returnTo)}`,
          cancelUrl: window.location.href,
        });
      }
    }
  }, [autoCheckout, selectedPlan, plans, billingInterval, returnTo, createCheckout]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;

    const plan = plans?.find((p: SubscriptionPlan) => p.id === selectedPlan);

    // Free plan - skip checkout, go directly to onboarding/dashboard
    if (plan?.priceMonthly === 0) {
      router.push(returnTo);
      return;
    }

    // Paid plan - create checkout session
    createCheckout.mutate({
      planId: selectedPlan,
      billingInterval,
      successUrl: `${window.location.origin}/subscription/success?returnTo=${encodeURIComponent(returnTo)}`,
      cancelUrl: window.location.href,
    });
  };

  const handleSkip = () => {
    // Store that user wants free tier
    localStorage.setItem('selectedPlan', 'freeflow');
    router.push(returnTo);
  };

  if (isLoadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20">
        <Loader2 className="size-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Filter out enterprise plan for self-service
  const availablePlans = plans?.filter((p: SubscriptionPlan) => p.name.toLowerCase() !== 'enterprise') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with a 7-day free trial. No credit card required for the free plan.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-gray-100">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingInterval === 'monthly'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billingInterval === 'yearly'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Yearly
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {availablePlans.map((plan: SubscriptionPlan) => {
            const planKey = plan.name.toLowerCase().replace(/\s+/g, '');
            const isSelected = selectedPlan === plan.id;
            const isFree = plan.priceMonthly === 0;
            const price = billingInterval === 'yearly' 
              ? (plan.priceYearly || plan.priceMonthly * 12) / 12 
              : plan.priceMonthly;
            const isPopular = planKey === 'smartflow';

            return (
              <Card
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={cn(
                  "relative p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected 
                    ? "ring-2 ring-purple-600 shadow-lg" 
                    : "hover:border-purple-300",
                  isPopular && "border-purple-300"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "flex size-12 items-center justify-center rounded-xl text-white bg-gradient-to-br",
                    PLAN_COLORS[planKey] || 'from-gray-500 to-gray-600'
                  )}>
                    {PLAN_ICONS[planKey] || <Sparkles className="size-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.displayName}</h3>
                    {isFree && (
                      <Badge variant="outline" className="text-xs">7-day trial</Badge>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${Math.round(price)}
                  </span>
                  {!isFree && (
                    <span className="text-gray-500">/month</span>
                  )}
                  {billingInterval === 'yearly' && !isFree && plan.priceYearly && (
                    <p className="text-sm text-green-600 mt-1">
                      Billed ${plan.priceYearly}/year
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {plan.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.slice(0, 5).map((feature, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature.displayName}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-sm text-purple-600 font-medium">
                      +{plan.features.length - 5} more features
                    </li>
                  )}
                </ul>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    isSelected && "bg-purple-600 hover:bg-purple-700"
                  )}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedPlan || createCheckout.isPending}
            onClick={handleContinue}
            className="min-w-[200px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {createCheckout.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Need a custom plan for your enterprise?</p>
          <Button variant="outline" onClick={() => window.open('mailto:sales@qualiflow.ai')}>
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

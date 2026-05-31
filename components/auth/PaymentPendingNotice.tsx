'use client';

import { useEffect, useState } from 'react';
import { Rocket, ArrowRight, Sparkles } from 'lucide-react';

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  'smart-flow': 'Smart Flow',
  'ultra-flow': 'Ultra Flow',
  'enterprise': 'Enterprise',
};

export function PaymentPendingNotice() {
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a pending paid plan in localStorage
    const pendingPlanId = localStorage.getItem('pendingPlanId');
    if (pendingPlanId && pendingPlanId !== 'free-flow') {
      setPendingPlan(pendingPlanId);
    }
  }, []);

  if (!pendingPlan) {
    return null;
  }

  const planDisplayName = PLAN_DISPLAY_NAMES[pendingPlan] || pendingPlan;

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-muted/300/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Rocket className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-yellow-300" />
              <span className="text-xs font-medium text-purple-200 uppercase tracking-wide">Almost There!</span>
            </div>
            <h3 className="text-lg font-bold">Get Started with {planDisplayName}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-purple-100 text-sm mb-4 leading-relaxed">
          Your email has been verified successfully. Sign in below to set up your business and complete your subscription.
        </p>

        {/* Flow indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">Sign In</span>
          <ArrowRight className="size-4 text-purple-300" />
          <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">Setup</span>
          <ArrowRight className="size-4 text-purple-300" />
          <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">Payment</span>
        </div>
      </div>
    </div>
  );
}

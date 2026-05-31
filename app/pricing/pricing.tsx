'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { gradients } from '@/lib/design-tokens';

interface PricingPlan {
  name: string;
  slug: string;
  description: string;
  price: {
    monthly: number | null;
    quarterly: number | null;
    annual: number | null;
  };
  annualTotal?: number | null;
  onboarding?: {
    price: number | null;
    required: boolean;
  } | null;
  popular?: boolean;
  usageLimits: string[];
  coreFeatures: string[];
  ctaText?: string;
  ctaLink?: string;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  onBillingPeriodChange: (period: 'monthly' | 'quarterly' | 'annual') => void;
  discounts: {
    quarterly: number;
    annual: number;
  };
  className?: string;
}

export function PricingSection({ 
  plans, 
  billingPeriod, 
  onBillingPeriodChange,
  discounts,
  className 
}: PricingSectionProps) {
  return (
    <section id="pricing" className={cn("py-20 md:py-32 bg-gradient-to-br from-indigo-50 via-white to-purple-50", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-indigo-700 text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Growth Plan
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start free, upgrade when you&apos;re ready. All plans include our core AI features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-full bg-muted/40 border border-border">
            {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onBillingPeriodChange(period)}
                className={cn(
                  "relative px-6 py-2 rounded-full text-sm font-medium transition-all",
                  billingPeriod === period
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period === 'monthly' && 'Monthly'}
                {period === 'quarterly' && (
                  <span className="flex items-center gap-2">
                    Quarterly
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Save {discounts.quarterly}%
                    </Badge>
                  </span>
                )}
                {period === 'annual' && (
                  <span className="flex items-center gap-2">
                    Annual
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Save {discounts.annual}%
                    </Badge>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard 
              key={index} 
              plan={plan} 
              billingPeriod={billingPeriod}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
}

function PricingCard({ plan, billingPeriod }: PricingCardProps) {
  const price = plan.price[billingPeriod];
  const isEnterprise = price === null;
  const isFree = price === 0;

  return (
    <div className={cn(
      "relative flex flex-col p-6 rounded-2xl border-2 bg-white transition-all duration-300",
      plan.popular 
        ? "border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10" 
        : "border-border hover:border-indigo-300 hover:shadow-lg"
    )}>
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className={`${gradients.primary} text-white border-0 px-4 py-1`}>
            Most Popular
          </Badge>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {isEnterprise ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">Custom</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">${price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        )}
        {plan.onboarding && (
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <Info className="size-4" />
            <span>
              ${plan.onboarding.price} onboarding
              {plan.onboarding.required ? ' (required)' : ' (optional)'}
            </span>
          </div>
        )}
      </div>

      {/* Usage Limits */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Usage Limits
        </p>
        <ul className="space-y-2">
          {plan.usageLimits.map((limit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-green-500 shrink-0" />
              {limit}
            </li>
          ))}
        </ul>
      </div>

      {/* Core Features */}
      <div className="mb-6 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Core Features
        </p>
        <ul className="space-y-2">
          {plan.coreFeatures.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Link
        href={plan.ctaLink || (isEnterprise ? '/contact' : `/register?plan=${plan.slug}`)}
        className={cn(
          "block w-full py-3 px-4 rounded-xl text-center font-semibold transition-all",
          plan.popular
            ? `${gradients.primary} text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl`
            : isFree
              ? "bg-muted/40 text-foreground hover:bg-muted"
              : "bg-muted/30 text-indigo-700 hover:bg-primary/10"
        )}
      >
        {plan.ctaText || (isEnterprise ? 'Contact Sales' : isFree ? 'Start Free' : 'Get Started')}
      </Link>
    </div>
  );
}

export default PricingSection;

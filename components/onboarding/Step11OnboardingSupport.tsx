'use client';

/**
 * Step 11: Onboarding Support Upsell
 * Price is API-driven from plan configuration (e.g., $700 for Smart Flow)
 * Only shown for plans with optional onboarding (onboardingRequired = false)
 *
 * Design: Uses shared OptionCard component for consistency with other onboarding steps
 */

import { OnboardingSupportSelection } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';
import { RecommendedBadge } from './shared/RecommendedBadge';
import { Check, Headphones, X } from 'lucide-react';

interface Step11OnboardingSupportProps {
  value: OnboardingSupportSelection;
  onChange: (value: OnboardingSupportSelection) => void;
  /** Onboarding price from API (plan.onboardingPrice) */
  price?: number;
}

const includedFeatures = [
  '1-Hour Kickoff Call',
  '1 Training Session',
  'Team Member Setup',
  'Knowledge Base Setup (Limited)',
  'CRM Setup (Basic)',
  'Channel Configuration',
  'Booking Calendar Setup',
  'Prebuilt Journey Activation',
];

export function Step11OnboardingSupport({ value, onChange, price }: Step11OnboardingSupportProps) {
  const handleAddNow = () => {
    onChange({ wantsSupport: true, selectedPackage: 'basic' });
  };

  const handleSkip = () => {
    onChange({ wantsSupport: false, selectedPackage: undefined });
  };

  // Format the price from API, fallback to loading state if not available yet
  const displayPrice = price !== undefined ? `$${price.toLocaleString()}` : '...';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">Would you like onboarding &amp; implementation support?</h2>
        <p className="body-text mt-2 text-gray-text">
          Get expert help to set up your account faster and maximize your results.
        </p>
      </div>

      {/* Option Cards - Matching other onboarding steps */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OptionCard
          icon={<Headphones className="w-7 h-7" />}
          title="Yes, add support"
          subtitle={`${displayPrice} one-time`}
          selected={value.wantsSupport === true}
          onClick={handleAddNow}
          variant="recommended"
          badge={<RecommendedBadge />}
        />
        <OptionCard
          icon={<X className="w-7 h-7" />}
          title="No thanks"
          subtitle="I'll set it up myself"
          selected={value.wantsSupport === false}
          onClick={handleSkip}
        />
      </div>

      {/* What's Included - Show when support is selected or as info */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-primary/10">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          What&apos;s included:
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Learn More Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-primary hover:text-primary hover:underline font-medium"
          onClick={() => window.open('/pricing#onboarding', '_blank')}
        >
          Learn more about onboarding support →
        </button>
      </div>
    </div>
  );
}


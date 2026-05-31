'use client';

/**
 * Step 8: Phone Setup
 * Simple selection between using existing phone or getting a Qualiflow AI Twilio number
 * Details are collected during channel activation
 */

import { useEffect } from 'react';
import { Phone, Headphones } from 'lucide-react';
import { PhoneSetupType } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step8PhoneSetupProps {
  value: {
    type: PhoneSetupType | '';
  };
  onChange: (value: { type: PhoneSetupType | '' }) => void;
}

const phoneOptions: Array<{
  value: PhoneSetupType;
  label: string;
  description: string;
  icon: typeof Phone;
  featureKey?: string;
}> = [
  {
    value: 'existing',
    label: 'Use Existing Phone',
    description: 'Connect your current business phone number',
    icon: Phone,
  },
  {
    value: 'qualiflow_twilio',
    label: 'Qualiflow AI Twilio Number',
    description: 'Get a new AI-powered phone number from Qualiflow AI',
    icon: Headphones,
    // No feature restriction - available on all plans (provisioning handled separately)
  },
];

export function Step8PhoneSetup({ value, onChange }: Step8PhoneSetupProps) {
  const { hasFeatureAccess, getUpgradeMessage, getRequiredPlan, hasError, error } = useFeatureAccess();

  const isOptionLocked = (featureKey?: string): boolean => {
    if (!featureKey) return false;
    if (hasError) return false;
    return !hasFeatureAccess(featureKey);
  };

  useEffect(() => {
    if (hasError && error) {
      toast.error(error, {
        duration: 8000,
        action: { label: 'Refresh', onClick: () => window.location.reload() },
      });
    }
  }, [hasError, error]);

  const handleOptionClick = (option: typeof phoneOptions[0]) => {
    if (option.featureKey && isOptionLocked(option.featureKey)) {
      toast.info(getUpgradeMessage(option.featureKey), {
        action: {
          label: 'View Plans',
          onClick: () => window.open('/pricing', '_blank'),
        },
      });
      return;
    }
    onChange({ type: option.value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">How would you like to handle phone calls?</h2>
        <p className="body-text mt-2 text-gray-text">
          Choose your phone setup preference. You&apos;ll provide additional details when activating the voice channel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {phoneOptions.map((option) => {
          const isLocked = isOptionLocked(option.featureKey);
          const requiredPlan = isLocked && option.featureKey ? getRequiredPlan(option.featureKey) : null;
          const Icon = option.icon;

          return (
            <OptionCard
              key={option.value}
              icon={<Icon className="w-8 h-8" />}
              title={option.label}
              subtitle={option.description}
              selected={value.type === option.value && !isLocked}
              onClick={() => handleOptionClick(option)}
              variant={isLocked ? 'locked' : 'default'}
              badge={isLocked ? <UpgradeBadge planName={requiredPlan || undefined} /> : undefined}
              disabled={isLocked}
            />
          );
        })}
      </div>

      <div className="rounded-xl bg-muted/30 border border-border p-4">
        <p className="text-sm text-info">
          <strong>Note:</strong> Phone number details and configuration will be set up when you activate the Voice channel in your dashboard.
        </p>
      </div>
    </div>
  );
}
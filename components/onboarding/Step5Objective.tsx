'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Objective } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { useFeatureAccess, requiresUpgrade } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step5ObjectiveProps {
  value: Objective | '';
  onChange: (value: Objective) => void;
}

const objectives = [
  { value: 'sales' as Objective, label: 'Increase Sales', description: 'Close more deals', icon: '/icons/industry/ecommerce.svg' },
  { value: 'automation' as Objective, label: 'Automate Workflows', description: 'Save time', icon: '/icons/industry/saas.svg' },
  { value: 'communication' as Objective, label: 'Better Communication', description: 'Engage customers', icon: '/icons/objectives/message.svg' },
  { value: 'meetings' as Objective, label: 'Book More Meetings', description: 'Fill your calendar', icon: '/icons/objectives/calendar.svg' },
  { value: 'proposals' as Objective, label: 'Send Proposals Faster', description: 'Quick quotes', icon: '/icons/objectives/document.svg' },
  { value: 'organize' as Objective, label: 'Organize Leads', description: 'Manage pipeline', icon: '/icons/objectives/settings.svg' },
];

export function Step5Objective({ value, onChange }: Step5ObjectiveProps) {
  const { hasFeatureAccess, getUpgradeMessage, getRequiredPlan, hasError, error } = useFeatureAccess();

  const isObjectiveLocked = (objectiveValue: string): boolean => {
    // If there's an error loading features, don't lock anything - let user proceed
    if (hasError) return false;
    const feature = requiresUpgrade(objectiveValue);
    return feature !== null && !hasFeatureAccess(feature);
  };

  // Show error notification if features couldn't be loaded
  useEffect(() => {
    if (hasError && error) {
      toast.error(error, {
        duration: 8000,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [hasError, error]);

  const handleObjectiveClick = (objective: Objective) => {
    if (isObjectiveLocked(objective)) {
      const feature = requiresUpgrade(objective);
      if (feature) {
        toast.info(getUpgradeMessage(feature), {
          action: {
            label: 'View Plans',
            onClick: () => window.open('/pricing', '_blank'),
          },
        });
      }
      return;
    }
    onChange(objective);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">What&apos;s your main objective?</h2>
        <p className="body-text mt-2 text-gray-text">
          We&apos;ll prioritize features and workflows to help you achieve this goal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.map((objective) => {
          const isLocked = isObjectiveLocked(objective.value);
          const feature = requiresUpgrade(objective.value);
          const requiredPlan = feature ? getRequiredPlan(feature) : null;

          return (
            <OptionCard
              key={objective.value}
              icon={
                <Image
                  src={objective.icon}
                  alt={objective.label}
                  width={32}
                  height={32}
                  unoptimized
                />
              }
              title={objective.label}
              subtitle={objective.description}
              selected={value === objective.value}
              onClick={() => handleObjectiveClick(objective.value)}
              variant={isLocked ? 'locked' : 'default'}
              badge={isLocked ? <UpgradeBadge planName={requiredPlan || undefined} /> : undefined}
              disabled={isLocked}
            />
          );
        })}
      </div>
    </div>
  );
}
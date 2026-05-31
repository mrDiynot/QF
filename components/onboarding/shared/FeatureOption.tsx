'use client';

/**
 * Feature Option Component for Onboarding
 * Renders a selectable option with subscription-based access control
 * Shows locked state with upgrade prompt for restricted features
 */

import { Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { ReactNode } from 'react';

interface FeatureOptionProps {
  /** Unique identifier for this option */
  id: string;
  /** Feature key to check against subscription (from ONBOARDING_TO_FEATURE_KEY) */
  featureKey?: string;
  /** Display title */
  title: string;
  /** Description text */
  description?: string;
  /** Icon to display */
  icon: ReactNode;
  /** Whether this option is currently selected */
  isSelected: boolean;
  /** Callback when option is clicked */
  onSelect: () => void;
  /** Whether this is a toggle (vs select) */
  isToggle?: boolean;
  /** Additional className */
  className?: string;
  /** Disable the option entirely */
  disabled?: boolean;
}

export function FeatureOption({
  featureKey,
  title,
  description,
  icon,
  isSelected,
  onSelect,
  isToggle = false,
  className,
  disabled = false,
}: FeatureOptionProps) {
  const { hasFeatureAccess, getRequiredPlan, isLoading, hasError } = useFeatureAccess();

  // Check if feature is available in current plan
  // If there's an error loading features, don't lock anything - let user proceed
  const hasAccess = !featureKey || hasError || hasFeatureAccess(featureKey);
  const isLocked = !hasAccess && !isLoading;
  const requiredPlan = isLocked && featureKey ? getRequiredPlan(featureKey) : null;

  const handleClick = () => {
    if (isLocked || disabled) return;
    onSelect();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocked || disabled}
      className={cn(
        'group relative w-full flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-300 ease-out overflow-hidden',
        isLocked
          ? 'border-border bg-muted/20 cursor-not-allowed opacity-75'
          : isSelected
            ? 'border-primary bg-gradient-to-r from-purple-50 via-white to-pink-50 shadow-lg shadow-purple-300/40 ring-2 ring-purple-400/50 ring-offset-1'
            : 'border-border bg-white hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 hover:shadow-md',
        className
      )}
    >
      {/* Animated gradient background on selection */}
      {isSelected && !isLocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse" />
      )}

      {/* Icon */}
      <div className={cn(
        'relative flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 z-10',
        isLocked
          ? 'bg-muted'
          : isSelected
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-lg shadow-purple-300/50'
            : 'bg-muted/40 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-pink-100'
      )}>
        <div className={cn(
          'w-6 h-6 transition-colors duration-300',
          isLocked ? 'text-muted-foreground/60' : isSelected ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
        )}>
          {icon}
        </div>
        {isLocked && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className={cn(
          'text-base font-semibold transition-all duration-300 flex items-center gap-2',
          isLocked ? 'text-muted-foreground' : isSelected ? 'text-primary' : 'text-foreground/80 group-hover:text-primary'
        )}>
          {title}
          {isLocked && requiredPlan && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {requiredPlan}
              <ArrowUpRight className="w-3 h-3" />
            </span>
          )}
        </div>
        {description && (
          <p className={cn(
            'text-sm mt-0.5 transition-colors duration-300',
            isLocked ? 'text-muted-foreground/60' : isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Toggle switch (for toggle mode) */}
      {isToggle && (
        <div className={cn(
          'relative w-14 h-8 rounded-full transition-all duration-300 z-10',
          isLocked
            ? 'bg-muted'
            : isSelected
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-inner'
              : 'bg-muted group-hover:bg-muted'
        )}>
          <div className={cn(
            'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center',
            isSelected && !isLocked ? 'left-7' : 'left-1'
          )}>
            {isSelected && !isLocked && <Sparkles className="w-3 h-3 text-primary" />}
          </div>
        </div>
      )}
    </button>
  );
}


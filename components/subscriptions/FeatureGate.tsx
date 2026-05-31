'use client';

/**
 * Feature Gate Component
 * Conditionally renders children based on subscription feature access
 * Shows upgrade prompt for locked features
 */

import { ReactNode } from 'react';
import { Lock, ArrowUpRight, Sparkles } from 'lucide-react';
import { useFeatureAccess, type FeatureKey } from '@/hooks/subscriptions/useFeatureAccess';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  /** Children to render if feature is available */
  children: ReactNode;
  /** Feature key to check access for */
  featureKey: FeatureKey;
  /** Fallback content when feature is locked (optional - uses default upgrade prompt) */
  fallback?: ReactNode;
  /** Whether to show a compact inline lock indicator instead of full upgrade prompt */
  compact?: boolean;
  /** Custom message for the upgrade prompt */
  upgradeMessage?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Gate component that conditionally renders children based on subscription features
 *
 * @example
 * // Full upgrade prompt
 * <FeatureGate featureKey="advanced_analytics">
 *   <AdvancedAnalyticsDashboard />
 * </FeatureGate>
 *
 * @example
 * // Compact inline indicator
 * <FeatureGate featureKey="crm_integration" compact>
 *   <CRMWidget />
 * </FeatureGate>
 *
 * @example
 * // Custom fallback
 * <FeatureGate featureKey="workflows" fallback={<BasicWorkflowView />}>
 *   <AdvancedWorkflowBuilder />
 * </FeatureGate>
 */
export function FeatureGate({
  children,
  featureKey,
  fallback,
  compact = false,
  upgradeMessage,
  className,
}: FeatureGateProps) {
  const { hasFeatureAccess, getRequiredPlan, isLoading, hasError } = useFeatureAccess();

  // While loading, show children (optimistic)
  if (isLoading) {
    return <>{children}</>;
  }

  // If there's an error loading features, don't lock anything
  if (hasError) {
    return <>{children}</>;
  }

  // Check if feature is available
  const hasAccess = hasFeatureAccess(featureKey);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Feature is locked - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  const requiredPlan = getRequiredPlan(featureKey);
  const message = upgradeMessage || `Upgrade to ${requiredPlan} to unlock this feature`;

  if (compact) {
    return (
      <div className={cn('relative', className)}>
        {/* Blurred/disabled content */}
        <div className="opacity-50 pointer-events-none blur-[2px]">
          {children}
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200">
            <Lock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">{requiredPlan}</span>
            <Link href="/settings/subscription">
              <ArrowUpRight className="w-4 h-4 text-amber-600 hover:text-amber-800" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full upgrade prompt
  return (
    <div className={cn(
      'rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8',
      className
    )}>
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-30" />
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2">
          Premium Feature
        </h3>

        {/* Message */}
        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        {/* Upgrade button */}
        <Link href="/settings/subscription">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to {requiredPlan}
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Higher-order component for feature-gated components
 */
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureKey: FeatureKey,
  gateProps?: Omit<FeatureGateProps, 'children' | 'featureKey'>
) {
  return function WithFeatureGateComponent(props: P) {
    return (
      <FeatureGate featureKey={featureKey} {...gateProps}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}


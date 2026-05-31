'use client';

/**
 * Subscription Banner for Onboarding
 * Displays current plan info and upgrade prompt across all onboarding steps
 * Now includes clickable upgrade option that opens PlanUpgradeModal
 *
 * Priority for determining displayed plan:
 * 1. confirmedPlanName from sessionStorage (set after payment success, before webhook processes)
 * 2. Pending subscription intent from backend (user selected paid plan, awaiting payment)
 * 3. Current subscription from API (actual subscription in database)
 */

import { useEffect, useState } from 'react';
import { Crown, Sparkles, Zap, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlanUpgradeModal } from '@/components/subscription/PlanUpgradeModal';

interface SubscriptionBannerProps {
  className?: string;
  compact?: boolean;
  variant?: 'dark' | 'light';
  /** Show upgrade button */
  showUpgrade?: boolean;
  /** Callback when plan is changed */
  onPlanChange?: (planId: string, isUpgrade: boolean) => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  freeflow: <Sparkles className="w-4 h-4" />,
  smartflow: <Zap className="w-4 h-4" />,
  ultraflow: <Crown className="w-4 h-4" />,
  enterprise: <Crown className="w-4 h-4" />,
};

const PLAN_COLORS_DARK: Record<string, string> = {
  freeflow: 'from-muted/20 to-muted/30 border-border text-muted-foreground',
  smartflow: 'from-info/20 to-info/30 border-info/30 text-info',
  ultraflow: 'from-primary/20 to-primary/30 border-primary/30 text-primary',
  enterprise: 'from-brand-orange/20 to-brand-orange/30 border-brand-orange/30 text-brand-orange',
};

const PLAN_COLORS_LIGHT: Record<string, string> = {
  freeflow: 'from-muted/30 to-muted/40 border-border text-foreground/80',
  smartflow: 'from-info/10 to-info/20 border-info/30 text-info',
  ultraflow: 'from-primary/10 to-primary/20 border-primary/30 text-primary',
  enterprise: 'from-amber-100 to-orange-100 border-amber-300 text-amber-700',
};

// Map plan IDs (slugs) to display names
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  'smartflow': 'Smart Flow',
  'smart-flow': 'Smart Flow',
  'ultraflow': 'Ultra Flow',
  'ultra-flow': 'Ultra Flow',
  'enterprise': 'Enterprise',
};

/** Get plan display name from plan ID/slug */
function getPlanDisplayName(planId: string): string | null {
  const normalizedPlanId = planId.toLowerCase().replace(/-/g, '');
  return PLAN_DISPLAY_NAMES[planId] || PLAN_DISPLAY_NAMES[normalizedPlanId] || null;
}

export function SubscriptionBanner({
  className,
  compact = false,
  variant = 'dark',
  showUpgrade = false,
  onPlanChange,
}: SubscriptionBannerProps) {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const [confirmedPlanName, setConfirmedPlanName] = useState<string | null>(null);
  const [pendingIntentPlanName, setPendingIntentPlanName] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isLight = variant === 'light';
  const PLAN_COLORS = isLight ? PLAN_COLORS_LIGHT : PLAN_COLORS_DARK;

  // Check for confirmed plan name from payment success (webhook may not have processed yet)
  useEffect(() => {
    const storedPlanName = sessionStorage.getItem('confirmedPlanName');
    if (storedPlanName) {
      setConfirmedPlanName(storedPlanName);
    }
  }, []);

  // Check for pending subscription intent or locally stored pending plan
  useEffect(() => {
    // Only fetch pending intent if we don't have a confirmed plan
    if (confirmedPlanName) return;

    // Immediately check localStorage for pending plan (synchronous, no network delay)
    const pendingPlanId = localStorage.getItem('pendingPlanId');
    if (pendingPlanId) {
      const displayName = getPlanDisplayName(pendingPlanId);
      if (displayName) {
        console.log('[SubscriptionBanner] Found pendingPlanId in localStorage:', pendingPlanId, '→', displayName);
        setPendingIntentPlanName(displayName);
      }
    }

    // Also check backend for pending subscription intent (Stripe checkout started)
    // This may override localStorage if there's a more specific intent in the database
    subscriptionsService.getPendingIntent()
      .then((intent) => {
        if (intent?.planDisplayName) {
          console.log('[SubscriptionBanner] Found pending intent from backend:', intent.planDisplayName);
          setPendingIntentPlanName(intent.planDisplayName);
        }
      })
      .catch((error) => {
        // API error is fine - we already have localStorage fallback set above
        console.log('[SubscriptionBanner] Could not fetch pending intent:', error);
      });
  }, [confirmedPlanName]);

  const handlePlanChange = (planId: string, isUpgrade: boolean) => {
    setShowUpgradeModal(false);
    onPlanChange?.(planId, isUpgrade);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Skeleton className={cn('h-8 w-48', isLight ? 'bg-muted' : 'bg-white/10')} />
      </div>
    );
  }

  // Determine effective plan name with priority:
  // 1. confirmedPlanName - from sessionStorage after payment success (webhook may not have processed yet)
  // 2. pendingIntentPlanName - user selected paid plan, awaiting payment completion
  // 3. subscription?.planName - actual subscription in database
  const effectivePlanName = confirmedPlanName || pendingIntentPlanName || subscription?.planName || 'Free Flow';
  const planKey = effectivePlanName.toLowerCase().replace(/\s+/g, '') || 'freeflow';
  const planName = effectivePlanName;

  // Indicate if we're showing the pending/intended plan (not yet active)
  const isPendingPlan = !confirmedPlanName && !!pendingIntentPlanName;

  // Only show trial info if we're using the actual subscription data (not confirmed or pending plan)
  const isTrial = !confirmedPlanName && !pendingIntentPlanName && subscription?.status === 'trialing';
  const trialDaysLeft = subscription?.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const colorClass = PLAN_COLORS[planKey] || PLAN_COLORS.freeflow;
  const icon = PLAN_ICONS[planKey] || PLAN_ICONS.freeflow;

  // Check if user can upgrade (not on highest tier and not showing a pending plan)
  const canUpgrade = !isPendingPlan && planKey !== 'enterprise' && planKey !== 'ultraflow';

  if (compact) {
    return (
      <>
        <div className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          'bg-gradient-to-r border backdrop-blur-sm',
          showUpgrade && canUpgrade ? 'cursor-pointer hover:opacity-90 transition-opacity' : '',
          colorClass,
          className
        )}
        onClick={showUpgrade && canUpgrade ? () => setShowUpgradeModal(true) : undefined}
        role={showUpgrade && canUpgrade ? 'button' : undefined}
        tabIndex={showUpgrade && canUpgrade ? 0 : undefined}
        >
          {icon}
          <span>{planName}</span>
          {isPendingPlan && (
            <span className="opacity-75">• pending</span>
          )}
          {isTrial && trialDaysLeft > 0 && (
            <span className="opacity-75">• {trialDaysLeft}d trial</span>
          )}
          {showUpgrade && canUpgrade && (
            <ChevronUp className="w-3 h-3 ml-1" />
          )}
        </div>

        {showUpgrade && (
          <PlanUpgradeModal
            open={showUpgradeModal}
            onOpenChange={setShowUpgradeModal}
            currentSubscription={subscription}
            onSuccess={handlePlanChange}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={cn(
        'flex items-center justify-center gap-2 px-4 py-2 rounded-xl',
        'bg-gradient-to-r border backdrop-blur-sm',
        colorClass,
        className
      )}>
        {icon}
        <span className="text-sm font-medium">
          Your Plan: <span className="font-bold">{planName}</span>
        </span>
        {isPendingPlan && (
          <span className="text-xs opacity-75 ml-1">
            (payment pending)
          </span>
        )}
        {isTrial && trialDaysLeft > 0 && (
          <span className="text-xs opacity-75 ml-1">
            ({trialDaysLeft} days left in trial)
          </span>
        )}
        {showUpgrade && canUpgrade && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUpgradeModal(true)}
            className={cn(
              'ml-2 h-6 px-2 text-xs font-medium',
              isLight
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-100'
                : 'text-orange-300 hover:text-orange-200 hover:bg-white/10'
            )}
          >
            <ChevronUp className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      {showUpgrade && (
        <PlanUpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          currentSubscription={subscription}
          onSuccess={handlePlanChange}
        />
      )}
    </>
  );
}


/**
 * Subscription Status Banner
 * Shows contextual banners based on subscription status:
 * - Trial expiring soon
 * - Free tier upgrade prompt
 * - Payment required (past due/suspended)
 */

'use client';

import { X, AlertTriangle, Clock, Sparkles, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';

interface SubscriptionStatusBannerProps {
  /** Whether to show dismissible close button */
  dismissible?: boolean;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

export function SubscriptionStatusBanner({ 
  dismissible = true, 
  onDismiss 
}: SubscriptionStatusBannerProps) {
  const router = useRouter();
  const { data: subscription, isLoading } = useCurrentSubscription();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || isDismissed || !subscription) {
    return null;
  }

  const status = subscription.status;
  const planName = subscription.planName?.toLowerCase() ?? '';
  const isFreeTier = planName.includes('free') || planName === 'freeflow';
  const isTrialing = status === 'trialing';
  const isPastDue = status === 'past_due';
  const isUnpaid = status === 'unpaid';
  const isCanceled = status === 'canceled';

  // Calculate trial days remaining
  const trialDaysRemaining = subscription.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    router.push('/settings/billing?action=upgrade');
  };

  const handleUpdatePayment = () => {
    router.push('/settings/billing?action=update-payment');
  };

  // Past due or unpaid - urgent payment required
  if (isPastDue || isUnpaid) {
    return (
      <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
        <CreditCard className="h-4 w-4" />
        <AlertTitle>Payment Required</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Your payment method failed. Please update to continue using Qualiflow AI.</span>
          <Button size="sm" variant="destructive" onClick={handleUpdatePayment}>
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Canceled - account needs reactivation
  if (isCanceled) {
    return (
      <Alert variant="destructive" className="mb-4 border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Subscription Canceled</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Your subscription is canceled. Reactivate to access all features.</span>
          <Button size="sm" variant="destructive" onClick={handleUpdatePayment}>
            Reactivate
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expiring soon (7 days or less)
  if (isTrialing && trialDaysRemaining <= 7 && trialDaysRemaining > 0) {
    return (
      <Alert className="mb-4 border-amber-500 bg-amber-50">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Trial Ending Soon</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span className="text-amber-700">
            Your trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}. 
            Upgrade now to keep all features.
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleUpgrade}>
              Upgrade Now
            </Button>
            {dismissible && (
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Free tier - suggest upgrade (less urgent)
  if (isFreeTier && status === 'active') {
    return (
      <Alert className="mb-4 border-primary/20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <Sparkles className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Unlock More Features</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span className="text-primary">
            Upgrade to SmartFlow for AI-powered lead qualification and more channels.
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={handleUpgrade}
            >
              Upgrade
            </Button>
            {dismissible && (
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}


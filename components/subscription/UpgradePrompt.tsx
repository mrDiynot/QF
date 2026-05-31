'use client';

/**
 * Upgrade Prompt Component (Figma Design Pattern)
 * Shows when user tries to access a feature requiring a higher tier plan
 * Matches the "This feature requires Ultra Flow" Figma design
 */

import { AlertTriangle, Lock, Zap, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Modal,
  ModalContent,
  ModalTitle,
} from '@/components/modals';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateCheckout } from '@/hooks/subscriptions/useSubscriptions';

interface UpgradePromptProps {
  /** Feature name that triggered the prompt */
  feature?: string;
  /** Custom reason message */
  reason?: string;
  /** Current plan name */
  currentPlan?: string;
  /** Required plan name (e.g., "Ultra Flow", "SmartFlow") */
  requiredPlan?: string;
  /** Display as inline alert instead of dialog */
  inline?: boolean;
  /** Control dialog visibility externally */
  showDialog?: boolean;
  /** Callback when dialog is closed */
  onClose?: () => void;
  /** Target plan ID for direct checkout */
  targetPlanId?: string;
  /** Show "Book a Demo" button */
  showDemoButton?: boolean;
}

export function UpgradePrompt({
  feature: _feature,
  reason,
  currentPlan: _currentPlan = 'Free Flow',
  requiredPlan = 'Ultra Flow',
  inline = false,
  showDialog = false,
  onClose,
  targetPlanId,
  showDemoButton = true,
}: UpgradePromptProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(showDialog);
  const createCheckoutMutation = useCreateCheckout();

  const handleUpgrade = async () => {
    if (targetPlanId) {
      // Direct checkout with specific plan
      createCheckoutMutation.mutate(
        {
          planId: targetPlanId,
          billingInterval: 'monthly',
          includeOnboarding: false,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        },
        {
          onSuccess: (data) => {
            window.location.href = data.checkoutUrl;
          }
        }
      );
    } else {
      // Navigate to pricing page
      router.push('/pricing');
    }
    setDialogOpen(false);
    onClose?.();
  };

  const handleBookDemo = () => {
    window.open('https://calendly.com/qualiflow/demo', '_blank');
  };

  const handleClose = () => {
    setDialogOpen(false);
    onClose?.();
  };

  // Inline alert variant
  if (inline) {
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <Lock className="size-4 text-primary" />
        <AlertTitle className="text-foreground">This feature requires {requiredPlan}</AlertTitle>
        <AlertDescription className="text-primary">
          <p className="mb-3">{reason || `Unlock advanced automation, proposals, and AI tools with ${requiredPlan}.`}</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleUpgrade}
              size="sm"
              disabled={createCheckoutMutation.isPending}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {createCheckoutMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Zap className="size-4 mr-2" />
              )}
              Upgrade Now
            </Button>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Dialog variant (Figma design)
  return (
    <Modal open={dialogOpen} onOpenChange={handleClose}>
      <ModalContent size="md" className="p-0 gap-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 pb-8">
          {/* Lock Icon + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
              <Lock className="size-6 text-primary" />
            </div>
            <ModalTitle className="text-xl font-semibold text-foreground">
              This feature requires {requiredPlan}
            </ModalTitle>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {reason || `Unlock advanced automation, proposals, and AI tools with ${requiredPlan}.`}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Upgrade Now - Orange/Red Gradient */}
            <Button
              onClick={handleUpgrade}
              disabled={createCheckoutMutation.isPending}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-lg"
            >
              {createCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </Button>

            {/* Book a Demo - Blue */}
            {showDemoButton && (
              <Button
                onClick={handleBookDemo}
                className="w-full h-12 text-base font-medium bg-muted/300 hover:bg-info text-white border-0 rounded-lg"
              >
                Book a Demo
              </Button>
            )}

            {/* Add Later - Outlined */}
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full h-12 text-base font-medium border-border text-foreground/80 hover:bg-muted/20 rounded-lg"
            >
              Add Later
            </Button>
          </div>

          {/* Learn More Link */}
          <div className="text-center mt-4">
            <Link
              href="/pricing"
              className="text-info hover:text-info text-sm font-medium hover:underline"
            >
              Learn More
            </Link>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

interface LimitReachedPromptProps {
  limitName: string;
  current: number;
  limit: number;
  inline?: boolean;
}

export function LimitReachedPrompt({
  limitName,
  current,
  limit,
  inline = false,
}: LimitReachedPromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/settings/billing?upgrade=true');
  };

  if (inline) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="size-4 text-red-600" />
        <AlertTitle className="text-red-900">Limit Reached</AlertTitle>
        <AlertDescription className="text-red-800">
          <p className="mb-3">
            You&apos;ve reached your {limitName} limit ({current}/{limit}). Upgrade to increase your limits.
          </p>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            <Zap className="size-4 mr-2" />
            Upgrade Plan
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 mb-1">Limit Reached</h4>
          <p className="text-sm text-red-800 mb-3">
            You&apos;ve used {current} of {limit} {limitName}. Upgrade to get more.
          </p>
          <Button
            onClick={handleUpgrade}
            size="sm"
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
          >
            <Zap className="size-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>
  );
}

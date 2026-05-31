'use client';

/**
 * Plan Upgrade Modal Component
 * Reusable modal for plan selection with pricing comparison, proration preview,
 * and Stripe checkout integration
 */

import { useState, useCallback, useMemo } from 'react';
import { Check, Loader2, ArrowRight, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { usePlans, useCreateCheckout } from '@/hooks/subscriptions/useSubscriptions';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan, BillingInterval, Subscription } from '@/types/api';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/modals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSubscription?: Subscription | null;
  /** Triggered when plan change is successful (used for post-upgrade actions) */
  onSuccess?: (planId: string, isUpgrade: boolean) => void;
  /** Source for analytics tracking */
  source?: 'onboarding' | 'settings' | 'limit_reached' | 'banner';
  /** Pre-select a specific plan */
  preSelectedPlanId?: string;
  /** Show downgrade warning for downgrades */
  showDowngradeWarning?: boolean;
}

interface PlanComparisonRowProps {
  feature: string;
  currentValue: string | number | boolean;
  newValue: string | number | boolean;
}

const PlanComparisonRow = ({ feature, currentValue, newValue }: PlanComparisonRowProps) => {
  const formatValue = (val: string | number | boolean) => {
    if (typeof val === 'boolean') return val ? '✓' : '✗';
    if (val === -1 || val === 'unlimited') return 'Unlimited';
    return String(val);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{feature}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground/60 line-through">{formatValue(currentValue)}</span>
        <ArrowRight className="size-3 text-muted-foreground/60" />
        <span className="text-sm font-medium text-foreground">{formatValue(newValue)}</span>
      </div>
    </div>
  );
};

export function PlanUpgradeModal({
  open,
  onOpenChange,
  currentSubscription,
  onSuccess,
  source: _source = 'settings',
  preSelectedPlanId,
  showDowngradeWarning = true,
}: PlanUpgradeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(preSelectedPlanId ?? null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const { data: plans, isLoading: plansLoading } = usePlans();
  const createCheckoutMutation = useCreateCheckout();

  const currentPlan = useMemo(() => {
    return plans?.find(p => p.id === currentSubscription?.planId);
  }, [plans, currentSubscription]);

  const selectedPlan = useMemo(() => {
    return plans?.find(p => p.id === selectedPlanId);
  }, [plans, selectedPlanId]);

  const isUpgrade = useMemo(() => {
    if (!currentPlan || !selectedPlan) return true;
    return selectedPlan.priceMonthly > currentPlan.priceMonthly;
  }, [currentPlan, selectedPlan]);

  const isDowngrade = useMemo(() => {
    if (!currentPlan || !selectedPlan) return false;
    return selectedPlan.priceMonthly < currentPlan.priceMonthly;
  }, [currentPlan, selectedPlan]);

  const resetModal = useCallback(() => {
    setSelectedPlanId(preSelectedPlanId ?? null);
    setStep('select');
    setBillingInterval('monthly');
  }, [preSelectedPlanId]);

  // Direct upgrade/downgrade mutation (for existing subscribers)
  const upgradeMutation = useMutation({
    mutationFn: (planId: string) =>
      isDowngrade
        ? subscriptionsService.downgradePlan(planId)
        : subscriptionsService.upgradePlan(planId),
    onSuccess: (_, planId) => {
      toast.success(isDowngrade ? 'Plan change scheduled!' : 'Plan upgraded successfully!');
      onSuccess?.(planId, !isDowngrade);
      onOpenChange(false);
      resetModal();
    },
    onError: () => {
      toast.error('Failed to change plan. Please try again.');
    },
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setStep('confirm');
  };

  const handleConfirmChange = async () => {
    if (!selectedPlanId) return;

    if (currentSubscription?.status === 'active' || currentSubscription?.status === 'trialing') {
      // Use direct upgrade for existing subscribers
      upgradeMutation.mutate(selectedPlanId);
    } else {
      // Use checkout for new subscriptions
      createCheckoutMutation.mutate(
        { planId: selectedPlanId, billingInterval, includeOnboarding: false },
        { onSuccess: (data) => window.location.href = data.checkoutUrl }
      );
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    switch (billingInterval) {
      case 'yearly': return plan.priceYearly ?? plan.priceMonthly * 12;
      case 'quarterly': return plan.priceQuarterly ?? plan.priceMonthly * 3;
      default: return plan.priceMonthly;
    }
  };

  const getMonthlyEquivalent = (plan: SubscriptionPlan) => {
    switch (billingInterval) {
      case 'yearly': return (plan.priceYearly ?? plan.priceMonthly * 12) / 12;
      case 'quarterly': return (plan.priceQuarterly ?? plan.priceMonthly * 3) / 3;
      default: return plan.priceMonthly;
    }
  };

  const getSavingsPercentage = (plan: SubscriptionPlan) => {
    const monthlyTotal = plan.priceMonthly * (billingInterval === 'yearly' ? 12 : billingInterval === 'quarterly' ? 3 : 1);
    const actualPrice = getPrice(plan);
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - actualPrice) / monthlyTotal) * 100);
  };

  const isPending = upgradeMutation.isPending || createCheckoutMutation.isPending;

  return (
    <Modal open={open} onOpenChange={(isOpen: boolean) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <ModalContent size="2xl">
        <ModalHeader>
          <ModalTitle className="text-2xl font-bold">
            {step === 'select' ? 'Choose Your Plan' : 'Confirm Plan Change'}
          </ModalTitle>
          <ModalDescription>
            {step === 'select'
              ? 'Select the plan that best fits your business needs'
              : isUpgrade
                ? 'Review your upgrade details'
                : 'Review the changes to your subscription'}
          </ModalDescription>
        </ModalHeader>

        {step === 'select' && (
          <>
            {/* Billing Interval Toggle */}
            <div className="flex justify-center mb-6">
              <Tabs value={billingInterval} onValueChange={(v) => setBillingInterval(v as BillingInterval)}>
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                  <TabsTrigger value="yearly" className="relative">
                    Yearly
                    <Badge className="ml-2 bg-green-500 text-white text-[10px]">Save 20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Plans Grid */}
            {plansLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground/60" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans?.filter(p => !p.name.toLowerCase().includes('enterprise')).map((plan) => {
                  const isCurrent = plan.id === currentSubscription?.planId;
                  const savings = getSavingsPercentage(plan);

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        'p-6 cursor-pointer transition-all hover:shadow-md',
                        isCurrent && 'ring-2 ring-orange-500 bg-orange-50/50',
                        plan.isPopular && !isCurrent && 'border-orange-200',
                        selectedPlanId === plan.id && !isCurrent && 'ring-2 ring-blue-500'
                      )}
                      onClick={() => !isCurrent && handlePlanSelect(plan.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        {plan.isPopular && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                            <Sparkles className="size-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            Current Plan
                          </Badge>
                        )}
                        {savings > 0 && billingInterval !== 'monthly' && (
                          <Badge className="bg-green-500 text-white">
                            Save {savings}%
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-foreground">
                        {plan.displayName || plan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {plan.description}
                      </p>

                      <div className="mt-4">
                        <span className="text-3xl font-bold text-foreground">
                          ${getMonthlyEquivalent(plan).toFixed(0)}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                        {billingInterval !== 'monthly' && (
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Billed ${getPrice(plan).toFixed(0)} {billingInterval}
                          </p>
                        )}
                      </div>

                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {typeof feature === 'string' ? feature : feature.displayName}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={cn(
                          'w-full mt-6',
                          isCurrent
                            ? 'bg-muted/40 text-muted-foreground cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90'
                        )}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && selectedPlan && (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setStep('select')}
              className="mb-4"
            >
              ← Back to plans
            </Button>

            {/* Downgrade Warning */}
            {isDowngrade && showDowngradeWarning && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="size-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Downgrade Notice:</strong> This change will take effect at the end of your
                  current billing period. Some features may become unavailable.
                </AlertDescription>
              </Alert>
            )}

            {/* Plan Change Summary */}
            <Card className="p-6">
              <h4 className="font-semibold text-lg mb-4">Plan Change Summary</h4>

              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-semibold text-lg">{currentPlan?.displayName || 'None'}</p>
                  <p className="text-muted-foreground">${currentPlan?.priceMonthly || 0}/mo</p>
                </div>
                <ArrowRight className="size-6 text-muted-foreground/60" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">New Plan</p>
                  <p className="font-semibold text-lg text-orange-600">{selectedPlan.displayName}</p>
                  <p className="text-orange-600">${getMonthlyEquivalent(selectedPlan).toFixed(0)}/mo</p>
                </div>
              </div>

              {/* Billing Info */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="size-4 text-info" />
                  <span className="font-medium">Billing Impact</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isUpgrade
                    ? 'You\'ll be charged immediately with prorated billing for the current period.'
                    : 'Your plan will change at the end of your current billing period.'}
                </p>
              </div>
            </Card>

            {/* Feature Comparison */}
            {currentPlan && (
              <Card className="p-6">
                <h4 className="font-semibold text-lg mb-4">What&apos;s Changing</h4>
                <div className="space-y-1">
                  <PlanComparisonRow
                    feature="AI Interactions"
                    currentValue={currentPlan.limits?.['ai_interactions'] ?? '0'}
                    newValue={selectedPlan.limits?.['ai_interactions'] ?? '0'}
                  />
                  <PlanComparisonRow
                    feature="Voice Minutes"
                    currentValue={currentPlan.limits?.['voice_minutes'] ?? '0'}
                    newValue={selectedPlan.limits?.['voice_minutes'] ?? '0'}
                  />
                  <PlanComparisonRow
                    feature="Team Members"
                    currentValue={currentPlan.limits?.['seats'] ?? '1'}
                    newValue={selectedPlan.limits?.['seats'] ?? '1'}
                  />
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmChange}
                disabled={isPending}
                className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : isUpgrade ? (
                  'Confirm Upgrade'
                ) : (
                  'Confirm Change'
                )}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

export default PlanUpgradeModal;

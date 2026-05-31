'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Zap,
  MessageSquare,
  Phone,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  ExternalLink,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { subscriptionsService } from '@/services/api/subscriptions.service';
import { toast } from 'sonner';
import type { SubscriptionPlan } from '@/types/api';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { Shield } from 'lucide-react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from '@/components/modals';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    trialing: { variant: 'secondary', label: 'Trial' },
    past_due: { variant: 'destructive', label: 'Past Due' },
    canceled: { variant: 'outline', label: 'Canceled' },
    unpaid: { variant: 'destructive', label: 'Unpaid' },
  };
  const { variant, label } = config[status] || { variant: 'outline', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

// Usage meter component
function UsageMeter({ 
  label, 
  icon, 
  used, 
  limit, 
  percentage 
}: { 
  label: string; 
  icon: React.ReactNode; 
  used: number; 
  limit: number; 
  percentage: number;
}) {
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-text-secondary'}`}>
          {used.toLocaleString()} / {limit === -1 ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />
    </div>
  );
}

// Plan comparison card
function PlanCard({ 
  plan, 
  currentPlanId,
  onSelect,
  isLoading
}: { 
  plan: SubscriptionPlan; 
  currentPlanId?: string;
  onSelect: (planId: string) => void;
  isLoading: boolean;
}) {
  const isCurrent = plan.id === currentPlanId;
  
  return (
    <Card className={`p-6 ${isCurrent ? 'ring-2 ring-orange-500' : ''} ${plan.isPopular ? 'border-orange-200' : ''}`}>
      {plan.isPopular && (
        <Badge className="mb-3 bg-orange-500">Most Popular</Badge>
      )}
      <h3 className="text-xl font-bold text-text-navy">{plan.displayName || plan.name}</h3>
      <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
      
      <div className="mt-4">
        <span className="text-3xl font-bold text-text-navy">${plan.priceMonthly}</span>
        <span className="text-text-secondary">/month</span>
      </div>
      
      <ul className="mt-4 space-y-2">
        {plan.features.slice(0, 5).map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
            {typeof feature === 'string' ? feature : feature.displayName}
          </li>
        ))}
      </ul>
      
      <Button 
        className={`w-full mt-4 ${isCurrent ? 'bg-gray-100 text-gray-500' : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white'}`}
        disabled={isCurrent || isLoading}
        onClick={() => onSelect(plan.id)}
      >
        {isCurrent ? 'Current Plan' : 'Select Plan'}
      </Button>
    </Card>
  );
}

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const { isAdminOrOwner } = usePermissions();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch current subscription
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: subscriptionsService.getCurrentSubscription,
  });

  // Fetch usage
  const { data: usage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['subscription', 'usage'],
    queryFn: subscriptionsService.getUsage,
  });

  // Fetch plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: subscriptionsService.getPlans,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: subscriptionsService.cancelSubscription,
    onSuccess: () => {
      toast.success('Subscription will be canceled at the end of the billing period');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancelDialog(false);
    },
    onError: () => {
      toast.error('Failed to cancel subscription');
    },
  });

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: subscriptionsService.reactivateSubscription,
    onSuccess: () => {
      toast.success('Subscription reactivated');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: () => {
      toast.error('Failed to reactivate subscription');
    },
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionsService.upgradePlan(planId),
    onSuccess: () => {
      toast.success('Subscription upgraded successfully');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setShowUpgradeDialog(false);
    },
    onError: () => {
      toast.error('Failed to upgrade subscription');
    },
  });

  // Billing portal mutation
  const billingPortalMutation = useMutation({
    mutationFn: () => subscriptionsService.getBillingPortalUrl(window.location.href),
    onSuccess: (data) => {
      window.open(data.portalUrl, '_blank');
    },
    onError: () => {
      toast.error('Failed to open billing portal');
    },
  });

  const handleUpgradeClick = (planId: string) => {
    setSelectedPlanId(planId);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlanId) {
      upgradeMutation.mutate(selectedPlanId);
    }
  };

  const isLoading = isLoadingSubscription || isLoadingUsage || isLoadingPlans;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Permission check - only Owners can manage billing, but Admins can view
  if (!isAdminOrOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-red-100">
          <Shield className="size-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 text-center max-w-md">
          Only business owners and admins can view billing information. Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-text-navy">Subscription</h1>
        <p className="text-base mt-3 text-text-secondary">
          Manage your subscription, view usage, and update billing
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold text-text-navy">
                {subscription?.planName || 'No Active Plan'}
              </h2>
              {subscription && <StatusBadge status={subscription.status} />}
            </div>

            {subscription && (
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <span>
                    {subscription.billingInterval === 'yearly' ? 'Billed Annually' : 'Billed Monthly'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Current period ends:</span>
                  <span className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="size-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Your subscription will be canceled at the end of the current billing period.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reactivateMutation.mutate()}
                  disabled={reactivateMutation.isPending}
                >
                  {reactivateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Reactivate
                </Button>
              </div>
            )}

            {subscription?.status === 'trialing' && subscription?.trialEnd && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="size-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => billingPortalMutation.mutate()}
              disabled={billingPortalMutation.isPending}
            >
              {billingPortalMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="size-4 mr-2" />
              )}
              Billing Portal
            </Button>
            {subscription && !subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="size-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Usage */}
      {usage && usage.aiInteractions && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-navy mb-4">Current Usage</h3>
          <div className="space-y-4">
            <UsageMeter
              label="AI Interactions"
              icon={<Zap className="size-4 text-purple-500" />}
              used={usage.aiInteractions?.used ?? 0}
              limit={usage.aiInteractions?.limit ?? 0}
              percentage={usage.aiInteractions?.percentage ?? 0}
            />
            <UsageMeter
              label="Voice Minutes"
              icon={<Phone className="size-4 text-green-500" />}
              used={usage.voiceMinutes?.used ?? 0}
              limit={usage.voiceMinutes?.limit ?? 0}
              percentage={usage.voiceMinutes?.percentage ?? 0}
            />
            <UsageMeter
              label="SMS Messages"
              icon={<MessageSquare className="size-4 text-blue-500" />}
              used={usage.smsMessages?.used ?? 0}
              limit={usage.smsMessages?.limit ?? 0}
              percentage={usage.smsMessages?.percentage ?? 0}
            />
            <UsageMeter
              label="Team Members"
              icon={<Users className="size-4 text-orange-500" />}
              used={usage.teamMembers?.used ?? 0}
              limit={usage.teamMembers?.limit ?? 0}
              percentage={usage.teamMembers?.percentage ?? 0}
            />
          </div>
        </Card>
      )}

      {/* Available Plans */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-navy mb-4">Available Plans</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanId={subscription?.planId}
              onSelect={handleUpgradeClick}
              isLoading={upgradeMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Modal open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Cancel Subscription</ModalTitle>
            <ModalDescription>
              Are you sure you want to cancel your subscription? You will continue to have access
              until the end of your current billing period.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Yes, Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upgrade Dialog */}
      <Modal open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Upgrade Subscription</ModalTitle>
            <ModalDescription>
              You are about to upgrade to a new plan. Your card will be charged the prorated amount
              for the remainder of your billing period.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"
              onClick={confirmUpgrade}
              disabled={upgradeMutation.isPending}
            >
              {upgradeMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <ArrowUpRight className="size-4 mr-2" />
              )}
              Confirm Upgrade
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}


'use client';

/**
 * Billing History Page
 * Shows invoices, payment methods, and billing history with real Stripe API integration
 * Note: Plan management is handled in /settings/subscription
 */

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  Zap,
  MessageSquare,
  Phone,
  Users,
  ArrowUpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmModal } from '@/components/modals';
import {
  subscriptionsService,
} from '@/services/api/subscriptions.service';
import { useCurrentSubscription, useSubscriptionUsage } from '@/hooks/subscriptions/useSubscriptions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type InvoiceStatus = 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; icon: React.ReactNode; color: string }> = {
  paid: {
    label: 'Paid',
    icon: <CheckCircle className="size-4" />,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  open: {
    label: 'Open',
    icon: <Clock className="size-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  draft: {
    label: 'Draft',
    icon: <FileText className="size-4" />,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  },
  void: {
    label: 'Void',
    icon: <XCircle className="size-4" />,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  uncollectible: {
    label: 'Uncollectible',
    icon: <AlertCircle className="size-4" />,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
};

export default function BillingHistoryPage() {
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription();
  const { data: usage, isLoading: isLoadingUsage } = useSubscriptionUsage();
  const [deletePaymentMethodId, setDeletePaymentMethodId] = useState<string | null>(null);

  // Fetch invoices from API
  const { data: invoiceData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => subscriptionsService.getInvoices(10),
  });

  // Fetch payment methods from API
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods, refetch: refetchPaymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => subscriptionsService.getPaymentMethods(),
  });

  const invoices = invoiceData?.invoices || [];

  const billingPortalMutation = useMutation({
    mutationFn: () => subscriptionsService.getBillingPortalUrl(window.location.href),
    onSuccess: (data) => {
      window.open(data.portalUrl, '_blank');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Failed to open billing portal', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoadingSubscription) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
            <p className="text-gray-600 mt-1">
              Manage your payment methods and view invoice history
            </p>
          </div>
          <Button
            onClick={() => billingPortalMutation.mutate()}
            disabled={billingPortalMutation.isPending}
            className="gap-2"
          >
            {billingPortalMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ExternalLink className="size-4" />
            )}
            Manage in Stripe
          </Button>
        </div>

        {/* Current Plan Card */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CreditCard className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {subscription?.planName || 'Free Plan'}
                </h2>
                <p className="text-sm text-gray-500">
                  {subscription?.billingInterval === 'yearly' ? 'Annual billing' : 'Monthly billing'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscription?.monthlyAmount || 0)}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-xs text-gray-500 mt-1">
                  Renews {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
          </div>

          {/* Manage Subscription Link */}
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/settings/subscription'}
              className="gap-2"
            >
              <ArrowUpCircle className="size-4" />
              Manage Subscription
            </Button>
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <AlertCircle className="size-4 inline mr-2" />
                Your subscription will be canceled at the end of the current billing period.
              </p>
            </div>
          )}
        </Card>

        {/* Usage Meters */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage This Period</h3>
              <p className="text-sm text-gray-500 mt-1">
                Track your resource consumption for the current billing cycle
              </p>
            </div>
          </div>

          {isLoadingUsage ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* AI Interactions */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-purple-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                    <Zap className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI Interactions</p>
                    <p className="text-xs text-gray-500">
                      {usage?.aiInteractions?.used ?? 0} / {usage?.aiInteractions?.limit ?? 50}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={usage?.aiInteractions?.percentage ?? 0} 
                  className="h-2"
                />
                {(usage?.aiInteractions?.percentage ?? 0) >= 80 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {(usage?.aiInteractions?.percentage ?? 0) >= 100 ? 'Limit reached!' : 'Approaching limit'}
                  </p>
                )}
              </div>

              {/* SMS Messages */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                    <MessageSquare className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS Messages</p>
                    <p className="text-xs text-gray-500">
                      {usage?.smsMessages?.used ?? 0} / {usage?.smsMessages?.limit ?? 100}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={usage?.smsMessages?.percentage ?? 0} 
                  className="h-2"
                />
                {(usage?.smsMessages?.percentage ?? 0) >= 80 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {(usage?.smsMessages?.percentage ?? 0) >= 100 ? 'Limit reached!' : 'Approaching limit'}
                  </p>
                )}
              </div>

              {/* Voice Minutes */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-green-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                    <Phone className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Voice Minutes</p>
                    <p className="text-xs text-gray-500">
                      {usage?.voiceMinutes?.used ?? 0} / {usage?.voiceMinutes?.limit ?? 60}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={usage?.voiceMinutes?.percentage ?? 0} 
                  className="h-2"
                />
                {(usage?.voiceMinutes?.percentage ?? 0) >= 80 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {(usage?.voiceMinutes?.percentage ?? 0) >= 100 ? 'Limit reached!' : 'Approaching limit'}
                  </p>
                )}
              </div>

              {/* Team Members */}
              <div className="p-4 rounded-xl border bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-orange-100">
                    <Users className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Members</p>
                    <p className="text-xs text-gray-500">
                      {usage?.teamMembers?.used ?? 1} / {usage?.teamMembers?.limit ?? 2}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={usage?.teamMembers?.percentage ?? 50} 
                  className="h-2"
                />
                {(usage?.teamMembers?.percentage ?? 0) >= 80 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {(usage?.teamMembers?.percentage ?? 0) >= 100 ? 'Limit reached!' : 'Approaching limit'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upgrade CTA if nearing limits */}
          {usage && (
            (usage.aiInteractions?.percentage ?? 0) >= 80 ||
            (usage.smsMessages?.percentage ?? 0) >= 80 ||
            (usage.voiceMinutes?.percentage ?? 0) >= 80 ||
            (usage.teamMembers?.percentage ?? 0) >= 80
          ) && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Need more resources?</p>
                  <p className="text-sm text-white/80">Upgrade your plan for higher limits</p>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={() => window.location.href = '/settings/subscription'}
                >
                  View Plans
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Payment Methods */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => billingPortalMutation.mutate()}
              disabled={billingPortalMutation.isPending}
              className="gap-2"
            >
              <Plus className="size-4" />
              Add New
            </Button>
          </div>
          
          {isLoadingPaymentMethods ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !paymentMethods || paymentMethods.length === 0 ? (
            <div className="p-4 rounded-lg bg-gray-50 border text-center">
              <CreditCard className="size-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No payment methods on file</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div 
                  key={pm.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    pm.isDefault && "border-purple-300 bg-purple-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white border">
                      <CreditCard className="size-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {pm.cardBrand} •••• {pm.cardLast4}
                        </p>
                        {pm.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="size-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Expires {pm.cardExpMonth?.toString().padStart(2, '0')}/{pm.cardExpYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!pm.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await subscriptionsService.setDefaultPaymentMethod(pm.id);
                            refetchPaymentMethods();
                            toast.success('Default payment method updated');
                          } catch {
                            toast.error('Failed to update default');
                          }
                        }}
                      >
                        Set Default
                      </Button>
                    )}
                    {!pm.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeletePaymentMethodId(pm.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Invoice History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Export All
            </Button>
          </div>

          {isLoadingInvoices ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="size-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status as InvoiceStatus] || STATUS_CONFIG.open;
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                        <FileText className="size-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.description || `Invoice #${invoice.number}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="size-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {formatDate(invoice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={cn("gap-1", statusConfig.color)}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {formatCurrency(invoice.amountDue / 100)}
                      </p>
                      {invoice.invoicePdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(invoice.invoicePdfUrl, '_blank')}
                        >
                          <Download className="size-4" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Help Section */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-start gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
              <AlertCircle className="size-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Need help with billing?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Contact our support team for questions about invoices, refunds, or payment issues.
              </p>
              <Button variant="link" className="px-0 mt-2 text-purple-600">
                Contact Support →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Payment Method Confirmation */}
      <ConfirmModal
        open={!!deletePaymentMethodId}
        onOpenChange={() => setDeletePaymentMethodId(null)}
        title="Delete Payment Method?"
        description="This will remove this payment method from your account. You can add it back later if needed."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deletePaymentMethodId) {
            try {
              await subscriptionsService.deletePaymentMethod(deletePaymentMethodId);
              refetchPaymentMethods();
              toast.success('Payment method removed');
            } catch {
              toast.error('Failed to remove payment method');
            }
            setDeletePaymentMethodId(null);
          }
        }}
        onCancel={() => setDeletePaymentMethodId(null)}
      />
    </div>
  );
}

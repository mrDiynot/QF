'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CreditCard,
  MoreHorizontal,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSubscriptions, useAdminSubscriptionMetrics, useCancelSubscription, useExtendTrial } from '@/hooks/admin';
import type { SubscriptionStatus, AdminSubscription } from '@/types/admin';
import { PageHeader, FilterBar, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatCard } from '@/components/admin/blocks/StatCard';

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Dialog states
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; subscription: AdminSubscription | null }>({
    open: false,
    subscription: null,
  });
  const [extendTrialDialog, setExtendTrialDialog] = useState<{ open: boolean; subscription: AdminSubscription | null }>({
    open: false,
    subscription: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [trialDays, setTrialDays] = useState(7);


  // Use React Query hooks for real data
  const { data, isLoading: loading, isError, refetch, isRefetching: refreshing } = useAdminSubscriptions({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter as SubscriptionStatus : undefined,
    page,
    pageSize,
  });
  const { data: metricsData } = useAdminSubscriptionMetrics();
  const cancelMutation = useCancelSubscription();
  const extendTrialMutation = useExtendTrial();

  // Extract data from response
  const subscriptions = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const metrics = {
    mrr: metricsData?.mrr ?? 0,
    arr: metricsData?.arr ?? 0,
    activeSubscriptions: metricsData?.activeSubscriptions ?? 0,
    churnRate: metricsData?.churnRate ?? 0,
    averageRevenuePerUser: metricsData?.averageRevenuePerUser ?? 0,
    trialingSubscriptions: metricsData?.trialingSubscriptions ?? 0,
    canceledThisMonth: metricsData?.canceledThisMonth ?? 0,
    byPlan: metricsData?.byPlan ?? [] as { planName: string; count: number; mrr: number; percentage: number }[]
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Clock className="h-3 w-3 mr-1" />Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><AlertTriangle className="h-3 w-3 mr-1" />Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Canceled</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-500 border-gray-200">Paused</Badge>;
      case 'incomplete':
        return <Badge className="bg-[#FF6900]/20 text-[#FF6900] border-[#FF6900]/30">Incomplete</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-500 border-gray-200">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCancelSubscription = () => {
    if (cancelDialog.subscription && cancelReason) {
      cancelMutation.mutate(
        { subscriptionId: cancelDialog.subscription.businessId, request: { reason: cancelReason } },
        {
          onSuccess: () => {
            setCancelDialog({ open: false, subscription: null });
            setCancelReason('');
          },
        }
      );
    }
  };

  const handleReactivate = (_subscription: AdminSubscription) => {
    toast.info('Reactivation is not yet available. Please contact engineering.');
  };

  const handleExtendTrial = () => {
    if (extendTrialDialog.subscription) {
      extendTrialMutation.mutate(
        { subscriptionId: extendTrialDialog.subscription.businessId, days: trialDays },
        {
          onSuccess: () => {
            setExtendTrialDialog({ open: false, subscription: null });
            setTrialDays(7);
          },
        }
      );
    }
  };

  // Define table columns
  const columns: DataTableColumn<AdminSubscription>[] = [
    {
      key: 'business',
      label: 'Business',
      sortable: true,
      width: 'min-w-[220px]',
      render: (sub) => (
        <div>
          <p className="font-medium text-admin-foreground">{sub.businessName}</p>
          <p className="text-sm text-admin-muted-foreground">{sub.businessEmail}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: true,
      render: (sub) => <span className="text-admin-foreground">{sub.planName}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (sub) => (
        <div className="flex flex-col gap-1">
          {getStatusBadge(sub.status)}
          {sub.cancelAtPeriodEnd && (
            <span className="text-xs text-amber-400">Cancels at period end</span>
          )}
        </div>
      ),
    },
    {
      key: 'mrr',
      label: 'MRR',
      sortable: true,
      render: (sub) => (
        <span className="text-admin-foreground font-medium">{formatCurrency(sub.mrr)}</span>
      ),
    },
    {
      key: 'trial',
      label: 'Trial',
      hideOnMobile: true,
      render: (sub) => (
        sub.status === 'trialing' && sub.trialEndsAt ? (
          <div className="text-xs">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Clock className="h-3 w-3 mr-1" />
              Ends {formatDate(sub.trialEndsAt)}
            </Badge>
          </div>
        ) : null
      ),
    },
    {
      key: 'periodEnd',
      label: 'Period End',
      sortable: true,
      hideOnMobile: true,
      render: (sub) => (
        <div className="flex items-center gap-1 text-admin-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(sub.currentPeriodEnd)}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      hideOnMobile: true,
      render: (sub) => (
        <span className="text-admin-muted-foreground text-sm">
          {formatDate(sub.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (subscription) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-admin-card border-admin-border">
            <DropdownMenuItem asChild>
              <Link href={`/admin/businesses/${subscription.businessId}`} className="flex items-center cursor-pointer text-admin-foreground hover:bg-admin-muted">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                View Business
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-admin-border" />
            {subscription.status === 'trialing' && (
              <DropdownMenuItem onClick={() => setExtendTrialDialog({ open: true, subscription })} className="text-admin-foreground hover:bg-admin-muted cursor-pointer">
                <Clock className="h-4 w-4 mr-2" />
                Extend Trial
              </DropdownMenuItem>
            )}
            {subscription.status === 'canceled' ? (
              <DropdownMenuItem onClick={() => handleReactivate(subscription)} className="text-green-400 hover:bg-green-500/10 cursor-pointer">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setCancelDialog({ open: true, subscription })} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage all platform subscriptions and billing"
        isError={isError}
        onRefresh={() => refetch()}
        isRefreshing={refreshing}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(metrics.mrr)}
          changeLabel={`ARR: ${formatCurrency(metrics.arr)}`}
          iconColor="text-emerald-400"
          loading={loading}
        />
        <StatCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
          changeLabel={`${metrics.trialingSubscriptions} trialing`}
          iconColor="text-blue-400"
          loading={loading}
        />
        <StatCard
          title="Churn Rate"
          value={`${metrics.churnRate.toFixed(1)}%`}
          change={metrics.churnRate > 5 ? metrics.churnRate : -metrics.churnRate}
          changeLabel={`${metrics.canceledThisMonth} canceled this month`}
          iconColor="text-[#FF6900]"
          loading={loading}
        />
        <StatCard
          title="Avg Revenue Per User"
          value={formatCurrency(metrics.averageRevenuePerUser)}
          changeLabel="per month"
          iconColor="text-purple-400"
          loading={loading}
        />
      </div>

      {/* Plan Breakdown */}
      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground">Subscriptions by Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.byPlan.map((plan: { planId: string; planName: string; count: number; mrr: number; percentage: number }) => (
              <div
                key={plan.planName}
                className="p-4 rounded-lg bg-admin-muted/50 border border-admin-border"
              >
                <p className="text-sm font-medium text-admin-foreground">{plan.planName}</p>
                <p className="text-2xl font-bold text-admin-foreground mt-1">{plan.count}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-admin-muted-foreground">
                    {formatCurrency(plan.mrr)} MRR
                  </span>
                  <Badge variant="outline" className="text-xs border-admin-border text-admin-muted-foreground">
                    {(plan.percentage ?? 0).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by business name or email..."
        filters={[
          {
            key: 'status',
            label: 'Filter by status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'trialing', label: 'Trialing' },
              { value: 'past_due', label: 'Past Due' },
              { value: 'canceled', label: 'Canceled' },
              { value: 'paused', label: 'Paused' },
            ],
          },
        ]}
      />

      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {totalCount} Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={subscriptions}
            columns={columns}
            getRowKey={(sub) => sub.id}
            loading={loading}
          />

          {totalPages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AdminModal open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, subscription: open ? cancelDialog.subscription : null })}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>Cancel Subscription</AdminModalTitle>
            <AdminModalDescription>
              Are you sure you want to cancel the subscription for{' '}
              <span className="font-medium text-white">{cancelDialog.subscription?.businessName}</span>?
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody>
            <Label className="text-admin-foreground text-sm font-medium">Reason for cancellation</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter the reason for cancellation..."
              className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
            />
          </AdminModalBody>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, subscription: null })}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={!cancelReason || cancelMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {cancelMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>

      {/* Extend Trial Dialog */}
      <AdminModal open={extendTrialDialog.open} onOpenChange={(open) => setExtendTrialDialog({ open, subscription: open ? extendTrialDialog.subscription : null })}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>Extend Trial</AdminModalTitle>
            <AdminModalDescription>
              Extend the trial period for{' '}
              <span className="font-medium text-white">{extendTrialDialog.subscription?.businessName}</span>
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody>
            <Label className="text-admin-foreground text-sm font-medium">Number of days to extend</Label>
            <Input
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value) || 7)}
              min={1}
              max={30}
              className="mt-1.5 bg-admin-background border-admin-border text-admin-foreground"
            />
          </AdminModalBody>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setExtendTrialDialog({ open: false, subscription: null })}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtendTrial}
              disabled={extendTrialMutation.isPending}
              className="bg-amber-500 text-black hover:bg-amber-600"
            >
              {extendTrialMutation.isPending ? 'Extending...' : 'Extend Trial'}
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}

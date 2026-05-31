'use client';

/**
 * Admin Billing Management Page
 * Revenue analytics from real subscription data.
 * Invoices, Payment Methods, and Disputes require Stripe integration (pending).
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { useAdminBillingMetrics, useAdminMrrHistory } from '@/hooks/admin';
import { PageHeader } from '@/components/admin/ui';
import { StatCard } from '@/components/admin/blocks/StatCard';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StripeComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-admin-card border-admin-border">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-amber-500/10 p-4 mb-4">
          <CreditCard className="h-8 w-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-admin-foreground mb-2">{title}</h3>
        <p className="text-admin-muted-foreground max-w-md mb-4">{description}</p>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
          <AlertCircle className="size-3 mr-1" />
          Stripe Integration Pending
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function AdminBillingPage() {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics, isRefetching, isError } = useAdminBillingMetrics();
  const { data: mrrHistory, isLoading: historyLoading } = useAdminMrrHistory(6);

  return (
    <div className="p-8 space-y-6" data-admin-theme="dark">
      <PageHeader
        title="Billing & Revenue"
        description="Revenue analytics from subscription data"
        isError={isError}
        onRefresh={() => refetchMetrics()}
        isRefreshing={isRefetching}
      />

      {/* Revenue Metrics - REAL DATA from subscriptions table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={formatCurrency(Number(metrics?.totalMRR ?? 0))}
          iconColor="text-green-400"
          changeLabel={`${metrics?.mrrGrowthPercent ?? 0}% growth`}
          loading={metricsLoading}
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={formatCurrency(Number(metrics?.totalARR ?? 0))}
          iconColor="text-blue-400"
          changeLabel="projected yearly"
          loading={metricsLoading}
        />
        <StatCard
          title="Paying Customers"
          value={metrics?.payingCustomers ?? 0}
          iconColor="text-purple-400"
          changeLabel={`ARPU: ${formatCurrency(Number(metrics?.arpu ?? 0))}`}
          loading={metricsLoading}
        />
        <StatCard
          title="Churn Rate"
          value={`${metrics?.churnRate ?? 0}%`}
          iconColor="text-amber-400"
          changeLabel={`LTV: ${formatCurrency(Number(metrics?.ltv ?? 0))}`}
          loading={metricsLoading}
        />
      </div>

      {/* MRR Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-admin-muted-foreground">New MRR</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              {metricsLoading ? '...' : formatCurrency(Number(metrics?.newMRR ?? 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-admin-muted-foreground">Churned MRR</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              {metricsLoading ? '...' : formatCurrency(Number(metrics?.churnedMRR ?? 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-admin-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-admin-muted-foreground">Net New MRR</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-admin-foreground">
              {metricsLoading ? '...' : formatCurrency(Number(metrics?.netNewMRR ?? 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MRR History Table */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            MRR History (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <p className="text-admin-muted-foreground text-center py-8">Loading...</p>
          ) : mrrHistory && mrrHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border">
                    <th className="text-left py-3 px-4 text-admin-muted-foreground font-medium">Month</th>
                    <th className="text-right py-3 px-4 text-admin-muted-foreground font-medium">MRR</th>
                    <th className="text-right py-3 px-4 text-admin-muted-foreground font-medium">Customers</th>
                    <th className="text-right py-3 px-4 text-admin-muted-foreground font-medium">New</th>
                    <th className="text-right py-3 px-4 text-admin-muted-foreground font-medium">Cancellations</th>
                  </tr>
                </thead>
                <tbody>
                  {mrrHistory.map((item: { year: number; month: string; monthNumber: number; mrr: number; customerCount: number; newSubscriptions: number; cancellations: number }) => (
                    <tr key={`${item.year}-${item.monthNumber}`} className="border-b border-admin-border/50">
                      <td className="py-3 px-4 text-admin-foreground font-medium">{item.month} {item.year}</td>
                      <td className="py-3 px-4 text-right text-green-400 font-medium">{formatCurrency(Number(item.mrr ?? 0))}</td>
                      <td className="py-3 px-4 text-right text-admin-foreground">{item.customerCount}</td>
                      <td className="py-3 px-4 text-right text-blue-400">+{item.newSubscriptions}</td>
                      <td className="py-3 px-4 text-right text-red-400">{item.cancellations > 0 ? `-${item.cancellations}` : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-admin-muted-foreground text-center py-8">No MRR history data available</p>
          )}
        </CardContent>
      </Card>

      {/* Stripe Integration Pending Sections */}
      <div className="space-y-4">
        <StripeComingSoonCard
          title="Invoices"
          description="Invoice management will be available once Stripe billing integration is connected. This will enable automatic invoice generation, payment tracking, and receipt management."
        />
        <StripeComingSoonCard
          title="Payment Methods"
          description="Payment method management requires Stripe integration. Once connected, you&apos;ll be able to view customer payment methods, default cards, and billing details."
        />
        <StripeComingSoonCard
          title="Disputes & Refunds"
          description="Dispute management and refund processing will be available with Stripe integration. This includes evidence submission, chargeback tracking, and automated refund workflows."
        />
      </div>
    </div>
  );
}

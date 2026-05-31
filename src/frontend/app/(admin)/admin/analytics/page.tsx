'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useAdminSubscriptionMetrics, useAdminDashboard } from '@/hooks/admin';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  // Fetch subscription metrics and dashboard data from API
  const {
    data: metrics,
    isLoading: metricsLoading,
    isRefetching: metricsRefetching,
    refetch: refetchMetrics,
    isError: metricsError
  } = useAdminSubscriptionMetrics();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    isRefetching: dashboardRefetching,
    refetch: refetchDashboard,
    isError: dashboardError
  } = useAdminDashboard();

  const loading = metricsLoading || dashboardLoading;
  const refreshing = metricsRefetching || dashboardRefetching;
  const hasError = metricsError || dashboardError;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleRefresh = () => {
    refetchMetrics();
    refetchDashboard();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 bg-admin-muted" />
          <Skeleton className="h-10 w-32 bg-admin-muted" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-admin-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 bg-admin-muted" />
          <Skeleton className="h-80 bg-admin-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-admin-foreground">Revenue Analytics</h1>
          <p className="text-admin-muted-foreground mt-1">
            Financial insights and business intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-admin-muted rounded-lg p-1">
            {(['7d', '30d', '90d', '12m'] as const).map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range)}
                className={`px-3 ${
                  dateRange === range
                    ? 'bg-admin-card text-admin-foreground'
                    : 'text-admin-muted-foreground hover:text-admin-foreground'
                }`}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">Failed to load analytics data. Please try refreshing.</span>
        </div>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR */}
          <Card className="bg-white border-2 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-admin-muted-foreground">
                Monthly Recurring Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-admin-foreground">
                {formatCurrency(metrics.mrr ?? 0)}
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                Current monthly recurring
              </p>
            </CardContent>
          </Card>

          {/* ARR */}
          <Card className="shadow-base bg-admin-card border-admin-border transition-all hover:shadow-base2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-admin-muted-foreground">
                Annual Recurring Revenue
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-admin-foreground">
                {formatCurrency(metrics.arr ?? 0)}
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                Projected annual revenue
              </p>
            </CardContent>
          </Card>

          {/* ARPU */}
          <Card className="shadow-base bg-admin-card border-admin-border transition-all hover:shadow-base2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-admin-muted-foreground">
                Avg Revenue Per User
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-admin-foreground">
                {formatCurrency(metrics.averageRevenuePerUser ?? 0)}
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                per month
              </p>
            </CardContent>
          </Card>

          {/* Churn Rate */}
          <Card className="shadow-base bg-admin-card border-admin-border transition-all hover:shadow-base2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-admin-muted-foreground">
                Churn Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-admin-foreground flex items-center gap-2">
                {(metrics.churnRate ?? 0).toFixed(1)}%
                {(metrics.churnRate ?? 0) <= 5 ? (
                  <TrendingDown className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-400" />
                )}
              </div>
              <p className="text-xs text-admin-muted-foreground mt-1">
                {metrics.canceledThisMonth ?? 0} canceled this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue by Plan */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-base bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-400" />
                Revenue by Plan
              </CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                MRR distribution across subscription tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(metrics.byPlan ?? []).map((plan: { planId: string; planName: string; count: number; mrr: number; percentage: number }, index: number) => {
                  const colors = [
                    'bg-blue-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-green-500',
                  ];
                  return (
                    <div key={plan.planName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                          <span className="text-sm font-medium text-admin-foreground">
                            {plan.planName}
                          </span>
                          <Badge variant="outline" className="text-xs border-admin-border text-admin-muted-foreground">
                            {plan.count ?? 0} subscribers
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-admin-foreground">
                          {formatCurrency(plan.mrr ?? 0)}
                        </span>
                      </div>
                      <div className="w-full bg-admin-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${plan.percentage ?? 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-admin-muted-foreground text-right">
                        {(plan.percentage ?? 0).toFixed(1)}% of total MRR
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Stats */}
          <Card className="shadow-base bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                Subscription Overview
              </CardTitle>
              <CardDescription className="text-admin-muted-foreground">
                Current subscription status breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-admin-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Users className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">Active</p>
                      <p className="text-xs text-admin-muted-foreground">Paying customers</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-admin-foreground">
                    {metrics.activeSubscriptions ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-admin-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">Trialing</p>
                      <p className="text-xs text-admin-muted-foreground">In free trial</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-admin-foreground">
                    {metrics.trialingSubscriptions ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-admin-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <ArrowDownRight className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">Canceled</p>
                      <p className="text-xs text-admin-muted-foreground">This month</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-admin-foreground">
                    {metrics.canceledThisMonth ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-admin-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-admin-foreground">Total</p>
                      <p className="text-xs text-admin-muted-foreground">All subscriptions</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-admin-foreground">
                    {metrics.totalSubscriptions ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend */}
      {metrics && (metrics.revenueByMonth ?? []).length > 0 && (
        <Card className="shadow-base bg-admin-card border-admin-border">
          <CardHeader>
            <CardTitle className="text-admin-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-admin-muted-foreground">
              Monthly recurring revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="flex items-end gap-2 h-40">
                {(metrics.revenueByMonth ?? []).map((month: { month: string; mrr: number; newMrr: number; churnedMrr: number }) => {
                  const revenueData = metrics.revenueByMonth ?? [];
                  const maxMrr = Math.max(...revenueData.map((m: { mrr: number }) => m.mrr ?? 0));
                  const heightPercent = maxMrr > 0 ? ((month.mrr ?? 0) / maxMrr) * 100 : 0;
                  return (
                    <div
                      key={month.month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t"
                        style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        title={`${month.month}: ${formatCurrency(month.mrr ?? 0)}`}
                      />
                      <span className="text-[10px] text-admin-muted-foreground rotate-45 origin-left">
                        {(month.month ?? '').slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-admin-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500 to-amber-400" />
                  <span className="text-xs text-admin-muted-foreground">MRR</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-admin-muted-foreground">New MRR</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-admin-muted-foreground">Churned MRR</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growth Metrics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-admin-card border-admin-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-admin-muted-foreground">Total Businesses</p>
                  <p className="text-2xl font-bold text-admin-foreground">
                    {dashboardData.totalBusinesses ?? 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {(dashboardData.businessGrowth ?? 0) >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                    )}
                    <span className={`text-xs ${(dashboardData.businessGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(dashboardData.businessGrowth ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-admin-muted-foreground">New Signups (7d)</p>
                  <p className="text-2xl font-bold text-admin-foreground">
                    {dashboardData.newSignups7d ?? 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {(dashboardData.signupGrowth ?? 0) >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-400" />
                    )}
                    <span className={`text-xs ${(dashboardData.signupGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercent(dashboardData.signupGrowth ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-admin-card border-admin-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-admin-muted-foreground">LTV Estimate</p>
                  <p className="text-2xl font-bold text-admin-foreground">
                    {formatCurrency((metrics?.averageRevenuePerUser ?? 0) * 18)}
                  </p>
                  <p className="text-xs text-admin-muted-foreground mt-1">
                    Based on 18-month avg. lifetime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

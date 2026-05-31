'use client';

import { useAdminSession } from '@/hooks/admin/useAdminSession';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { semanticColors } from '@/lib/design-tokens';
import { 
  Building2, 
  Activity,
  Ticket,
  FileEdit,
  Brain,
  ShieldCheck,
  ScrollText,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  WelcomeBlock,
  StatCard,
  QuickActionsCard,
  SubscriptionBreakdownCard,
  RevenueReportChart,
  OverviewChart,
  GeoDistributionChart,
} from '@/components/admin/blocks';

export default function AdminDashboardPage() {
  useAdminSession(); // Ensure admin session is active
  const { data: dashboardData, isLoading, isError, refetch, isRefetching } = useAdminDashboard();

  const quickActions = [
    {
      label: 'View Businesses',
      href: '/admin/businesses',
      icon: Building2,
      description: 'Manage tenant accounts',
    },
    {
      label: 'Support Tickets',
      href: '/admin/support',
      icon: Ticket,
      description: 'Handle customer issues',
      badge: 'New',
    },
    {
      label: 'CMS & Content',
      href: '/admin/cms',
      icon: FileEdit,
      description: 'Manage landing pages',
    },
    {
      label: 'AI Usage',
      href: '/admin/ai-usage',
      icon: Brain,
      description: 'Monitor AI consumption',
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ScrollText,
      description: 'Review activity logs',
    },
    {
      label: 'Admin Users',
      href: '/admin/admin-users',
      icon: ShieldCheck,
      description: 'Manage platform admins',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-admin-foreground">Dashboard Analytics</h1>
        <div className="flex items-center gap-2">
          {isError && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">API Error - Using cached data</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="border-admin-border"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Welcome Section - Dashcode Layout */}
      <div className="grid grid-cols-12 items-stretch gap-5">
        <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
          <WelcomeBlock
            title="Welcome Admin"
            subtitle="Manage your platform"
            badge="now"
          />
        </div>
        
        {/* Stats Row - Inside a Card like Dashcode */}
        <div className="2xl:col-span-9 lg:col-span-8 col-span-12">
          <Card className="shadow-base">
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Total Businesses"
                  value={dashboardData?.totalBusinesses ?? 0}
                  change={dashboardData?.businessGrowth ?? 0}
                  changeLabel="last month"
                  iconColor="text-dashcode-info"
                  loading={isLoading}
                  className="border-none shadow-none bg-primary-10"
                  sparklineColor="#FF6900"
                />
                <StatCard
                  title="Active Users"
                  value={dashboardData?.totalUsers ?? 0}
                  change={dashboardData?.userGrowth ?? 0}
                  changeLabel="last month"
                  iconColor="text-dashcode-warning"
                  loading={isLoading}
                  className="border-none shadow-none bg-accent-10"
                  sparklineColor="#FF6900"
                />
                <StatCard
                  title="Monthly MRR"
                  value={`$${(dashboardData?.mrr ?? 0).toLocaleString()}`}
                  changeLabel="monthly recurring revenue"
                  iconColor="text-dashcode-primary"
                  loading={isLoading}
                  className="border-none shadow-none bg-success-10"
                  sparklineColor={semanticColors.success.main}
                />
                <StatCard
                  title="Active Subscriptions"
                  value={dashboardData?.activeSubscriptions ?? 0}
                  changeLabel="paid plans"
                  iconColor="text-emerald-400"
                  loading={isLoading}
                  className="border-none shadow-none bg-success-10"
                  sparklineColor="#10b981"
                />
                <StatCard
                  title="New Signups (7d)"
                  value={dashboardData?.newSignups7d ?? 0}
                  change={dashboardData?.signupGrowth ?? 0}
                  changeLabel="vs prior week"
                  iconColor="text-purple-400"
                  loading={isLoading}
                  className="border-none shadow-none bg-accent-10"
                  sparklineColor="#a855f7"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row - Like Dashcode */}
      <div className="grid grid-cols-12 gap-5">
        <div className="2xl:col-span-8 lg:col-span-7 col-span-12">
          <RevenueReportChart />
        </div>
        <div className="2xl:col-span-4 lg:col-span-5 col-span-12">
          <OverviewChart />
        </div>
      </div>

      {/* Geo Distribution & Quick Actions Row */}
      <div className="grid grid-cols-12 gap-5">
        <div className="2xl:col-span-8 lg:col-span-7 col-span-12">
          <GeoDistributionChart />
        </div>
        <div className="2xl:col-span-4 lg:col-span-5 col-span-12">
          <QuickActionsCard actions={quickActions} />
        </div>
      </div>

      {/* Activity Feed - Full Width */}
      <Card className="shadow-base">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold text-admin-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#FF6900]" />
            Recent Activity
          </CardTitle>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="sm" className="text-sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ActivityFeed
            activities={dashboardData?.recentActivity ?? []}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Subscription Breakdown */}
      <SubscriptionBreakdownCard
        plans={dashboardData?.subscriptionsByPlan ?? []}
        loading={isLoading}
      />
    </div>
  );
}

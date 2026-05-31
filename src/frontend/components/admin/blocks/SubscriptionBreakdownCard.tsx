'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PlanData {
  planName: string;
  count: number;
  revenue: number; // Backend sends "revenue", not "mrr"
  color?: string;
}

interface SubscriptionBreakdownCardProps {
  plans: PlanData[];
  loading?: boolean;
  className?: string;
}

const planColors: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  FreeFlow: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', hex: '#818CF8' },
  SmartFlow: { bg: 'bg-muted/300/10', text: 'text-blue-400', border: 'border-blue-500/20', hex: '#3B82F6' },
  UltraFlow: { bg: 'bg-primary/50/10', text: 'text-purple-400', border: 'border-primary/20', hex: '#8B5CF6' },
  Enterprise: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', hex: '#F97316' },
};

export function SubscriptionBreakdownCard({
  plans,
  loading = false,
  className,
}: SubscriptionBreakdownCardProps) {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  // Safely handle plans array that may have missing properties
  const safePlans = (plans ?? []).map(plan => ({
    planName: plan.planName ?? 'Unknown',
    count: plan.count ?? 0,
    revenue: plan.revenue ?? 0,
  }));

  const totalMRR = safePlans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscriptions = safePlans.reduce((sum, plan) => sum + plan.count, 0);

  const chartSeries = safePlans.map(p => p.count);
  const chartLabels = safePlans.map(p => p.planName);
  const chartColors = safePlans.map(p => planColors[p.planName]?.hex || '#64748B');

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    labels: chartLabels,
    colors: chartColors,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              fontSize: '28px',
              fontWeight: 700,
              color: isDark ? '#F8FAFC' : '#1e293b',
              offsetY: 8,
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '13px',
              fontWeight: 500,
              color: isDark ? '#94A3B8' : '#64748b',
              formatter: () => String(totalSubscriptions),
            },
          },
        },
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  if (loading) {
    return (
      <Card className={cn('bg-admin-card border-admin-border', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-admin-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 bg-admin-muted rounded-lg" />
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 bg-admin-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-base', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-admin-foreground">
          Subscription Breakdown
        </CardTitle>
        <div className="text-right">
          <p className="text-2xl font-bold text-admin-foreground">
            ${totalMRR.toLocaleString()}
          </p>
          <p className="text-xs text-admin-muted-foreground">
            Total MRR • {totalSubscriptions} subscriptions
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <div className="flex items-center justify-center">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={250}
              width={250}
            />
          </div>
          
          {/* Plan Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {safePlans.map((plan) => {
              const colors = planColors[plan.planName] || planColors.FreeFlow;
              const percentage = totalSubscriptions > 0 
                ? Math.round((plan.count / totalSubscriptions) * 100) 
                : 0;
              
              return (
                <div
                  key={plan.planName}
                  className={cn(
                    'p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5',
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('w-3 h-3 rounded-full', colors.text.replace('text-', 'bg-'))} />
                    <p className={cn('text-sm font-medium', colors.text)}>
                      {plan.planName}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-admin-foreground">
                    {plan.count}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-admin-muted-foreground">
                      ${plan.revenue.toLocaleString()} MRR
                    </p>
                    <span className="text-xs font-medium text-admin-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-admin-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', colors.text.replace('text-', 'bg-'))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

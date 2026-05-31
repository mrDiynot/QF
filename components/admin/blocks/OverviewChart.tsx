'use client';

import dynamic from 'next/dynamic';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface OverviewChartProps {
  className?: string;
}

export function OverviewChart({ className }: OverviewChartProps) {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const { data: dashboardData } = useAdminDashboard();

  // Use real subscription data from API
  const subscriptionsByPlan = dashboardData?.subscriptionsByPlan || [];
  const hasData = subscriptionsByPlan.length > 0;
  
  const series = hasData ? subscriptionsByPlan.map(plan => plan.count) : [];
  const labels = hasData ? subscriptionsByPlan.map(plan => plan.planName) : [];
  const totalSubscriptions = hasData ? subscriptionsByPlan.reduce((sum, plan) => sum + plan.count, 0) : 0;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
            color: isDark ? '#94a3b8' : '#64748b',
          },
          value: {
            fontSize: '16px',
            fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#1e293b',
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            color: isDark ? '#94a3b8' : '#64748b',
            formatter: () => totalSubscriptions.toString(),
          },
        },
      },
    },
    colors: ['#4669FA', '#0CE7FA', '#50C793', '#FA916B'],
    labels: labels,
    stroke: {
      lineCap: 'round',
    },
    legend: {
      show: false,
    },
  };

  return (
    <Card className={`shadow-base ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-admin-foreground">Subscription Overview</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={350}
              width="100%"
            />
            {/* Bottom stats - Real data from API */}
            <div className="bg-admin-muted rounded-lg p-4 mt-4 flex justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h4 className="text-admin-muted-foreground text-xs font-normal">
                  Total MRR
                </h4>
                <div className="text-sm font-semibold text-admin-foreground">
                  ${dashboardData?.mrr?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-admin-muted-foreground text-xs font-normal">
                  Active Subs
                </h4>
                <div className="text-sm font-semibold text-admin-foreground">
                  {dashboardData?.activeSubscriptions || 0}
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-admin-muted-foreground text-xs font-normal">
                  Growth
                </h4>
                <div className="text-sm font-semibold text-admin-foreground">
                  +{dashboardData?.signupGrowth?.toFixed(1) || '0'}%
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <PieChart className="h-12 w-12 text-admin-muted-foreground mb-4 opacity-50" />
            <p className="text-admin-foreground font-medium mb-2">Subscription Overview</p>
            <p className="text-sm text-admin-muted-foreground max-w-md">
              Subscription distribution will display here as businesses sign up. Currently showing live data from the API.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueReportChartProps {
  className?: string;
}

export function RevenueReportChart({ className }: RevenueReportChartProps) {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const { data: dashboardData } = useAdminDashboard();

  // Use real data from API - for now showing current metrics as single data points
  // Future: Backend will provide time-series data for charts
  const hasData = dashboardData && (dashboardData.totalBusinesses > 0 || dashboardData.totalUsers > 0);
  
  const series = hasData ? [
    {
      name: 'Total Businesses',
      data: [dashboardData.totalBusinesses],
    },
    {
      name: 'Total Users',
      data: [dashboardData.totalUsers],
    },
    {
      name: 'Active Subscriptions',
      data: [dashboardData.activeSubscriptions],
    },
  ] : [];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: hasData ? ['Current'] : [],
      labels: {
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#94a3b8' : '#64748b',
          fontSize: '12px',
        },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `${val.toLocaleString()}`,
      },
    },
    colors: ['#4669FA', '#0CE7FA', '#FA916B'],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: {
        colors: isDark ? '#cbd5e1' : '#475569',
      },
      markers: {
        size: 8,
        offsetX: -4,
      },
      itemMargin: {
        horizontal: 12,
      },
    },
    grid: {
      borderColor: isDark ? '#334155' : '#e2e8f0',
      strokeDashArray: 4,
    },
  };

  return (
    <Card className={`shadow-base ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold text-admin-foreground">Platform Metrics</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {hasData ? (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={350}
            width="100%"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <TrendingUp className="h-12 w-12 text-admin-muted-foreground mb-4 opacity-50" />
            <p className="text-admin-foreground font-medium mb-2">Real-Time Metrics</p>
            <p className="text-sm text-admin-muted-foreground max-w-md">
              Platform metrics will display here as your platform grows. Currently showing live data from the API.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

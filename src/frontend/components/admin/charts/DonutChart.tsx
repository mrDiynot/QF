'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonutChartProps {
  height?: number;
  series?: number[];
  labels?: string[];
  colors?: string[];
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  height = 300,
  series = [44, 55, 67, 83],
  labels = ['Active', 'Trial', 'Canceled', 'Suspended'],
  colors = ['#22C55E', '#F59E0B', '#EF4444', '#6B7280'],
  centerLabel = 'Total',
  centerValue = '249',
}: DonutChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              color: isDark ? '#94A3B8' : '#64748B',
              offsetY: 5,
            },
            value: {
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: isDark ? '#F8FAFC' : '#0F172A',
              offsetY: -10,
            },
            total: {
              show: true,
              label: centerLabel,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              color: isDark ? '#94A3B8' : '#64748B',
              formatter: () => String(centerValue),
            },
          },
        },
      },
    },
    colors,
    labels,
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      labels: {
        colors: isDark ? '#CBD5E1' : '#475569',
      },
      markers: {
        size: 6,
        offsetX: -4,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    dataLabels: { enabled: false },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="donut"
      height={height}
      width="100%"
    />
  );
}

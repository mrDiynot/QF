'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SparklineChartProps {
  height?: number;
  width?: number;
  series?: number[];
  color?: string;
  chartType?: 'area' | 'line' | 'bar';
}

export function SparklineChart({
  height = 48,
  width = 80,
  series = [800, 600, 1000, 800, 600, 1000, 800, 900],
  color = '#00EBFF',
  chartType = 'area',
}: SparklineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartSeries = [{ data: series }];

  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: { show: false },
      sparkline: { enabled: true },
      background: 'transparent',
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: [color],
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      fixed: {
        enabled: false,
      },
      x: { show: false },
      y: {
        title: {
          formatter: () => '',
        },
      },
    },
    grid: { show: false },
    yaxis: { show: false },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
  };

  return (
    <Chart
      options={options}
      series={chartSeries}
      type={chartType}
      height={height}
      width={width}
    />
  );
}

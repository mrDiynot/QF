'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueBarChartProps {
  height?: number;
  chartType?: 'bar' | 'area';
  series?: ApexAxisChartSeries;
  chartColors?: string[];
  categories?: string[];
  title?: string;
}

const defaultSeries = [
  {
    name: 'Net Profit',
    data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
  },
  {
    name: 'Revenue',
    data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
  },
  {
    name: 'Free Cash Flow',
    data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
  },
];

const defaultCategories = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export function RevenueBarChart({
  height = 350,
  chartType = 'bar',
  series = defaultSeries,
  chartColors = ['#4669FA', '#0CE7FA', '#FA916B'],
  categories = defaultCategories,
  title = 'Revenue Report',
}: RevenueBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '45%',
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      offsetY: -10,
      markers: {
        size: 4,
        offsetY: 0,
        offsetX: -5,
      },
      labels: {
        colors: isDark ? '#CBD5E1' : '#475569',
      },
      itemMargin: {
        horizontal: 18,
        vertical: 0,
      },
    },
    title: {
      text: title,
      align: 'left',
      offsetY: 0,
      style: {
        fontSize: '18px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        color: isDark ? '#fff' : '#0f172a',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#CBD5E1' : '#475569',
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: isDark ? '#CBD5E1' : '#475569',
          fontFamily: 'Inter, sans-serif',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (val: number) => `$${val}k`,
      },
    },
    colors: chartColors,
    grid: {
      show: true,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      strokeDashArray: 4,
      position: 'back',
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type={chartType}
      height={height}
      width="100%"
    />
  );
}

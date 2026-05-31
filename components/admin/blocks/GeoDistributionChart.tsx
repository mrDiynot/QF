'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Globe, Info } from 'lucide-react';

interface RegionData {
  name: string;
  value: string;
  color: string;
}

interface GeoDistributionChartProps {
  className?: string;
  title?: string;
  totalLabel?: string;
  totalValue?: string;
  growth?: string;
  regions?: RegionData[];
}

// Geographic distribution data will come from backend API in future
const defaultRegions: RegionData[] = [];

export function GeoDistributionChart({
  className,
  title = 'Geographic Distribution',
  totalLabel: _totalLabel = 'Total earnings',
  totalValue: _totalValue = '$0',
  growth: _growth = '+0%',
  regions: _regions = defaultRegions,
}: GeoDistributionChartProps) {
  return (
    <Card className={cn('shadow-base', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold text-admin-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-[350px] text-center p-8">
          <div className="relative mb-6">
            <Globe className="h-16 w-16 text-admin-muted-foreground opacity-50" />
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
              <Info className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-admin-foreground font-medium mb-2 text-lg">Geographic Analytics Coming Soon</p>
          <p className="text-sm text-admin-muted-foreground max-w-md leading-relaxed">
            Geographic distribution and regional analytics will be available in a future update. This feature requires additional backend API endpoints to track business locations and regional revenue data.
          </p>
          <div className="mt-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400 font-medium">Feature Status: Planned for Q2 2026</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

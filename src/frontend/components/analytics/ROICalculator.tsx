'use client';

/**
 * ROI Calculator Component
 * Calculates and displays return on investment metrics
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoi, useDashboardMetrics, useConversionFunnel } from '@/hooks/api/useAnalytics';

interface ROICalculatorProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function ROICalculator({ className, variant = 'full' }: ROICalculatorProps) {
  const { isLoading: loadingRoi } = useRoi();
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: funnel, isLoading: loadingFunnel } = useConversionFunnel();

  // User inputs for custom calculation
  const [monthlySpend, setMonthlySpend] = useState<number>(99);
  const [avgDealValue, setAvgDealValue] = useState<number>(2500);
  const [showCustom, setShowCustom] = useState(false);

  const isLoading = loadingRoi || loadingMetrics || loadingFunnel;

  // Calculate ROI metrics
  const calculatedMetrics = useMemo(() => {
    const leadsGenerated = metrics?.totalLeads || 0;
    const closedDeals = funnel?.closedWon || 0;
    const conversionRate = leadsGenerated > 0 ? (closedDeals / leadsGenerated) * 100 : 0;
    
    // Revenue from closed deals
    const totalRevenue = closedDeals * avgDealValue;
    
    // ROI calculation: ((Revenue - Cost) / Cost) * 100
    const totalCost = monthlySpend;
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    
    // Cost per lead
    const costPerLead = leadsGenerated > 0 ? totalCost / leadsGenerated : 0;
    
    // Cost per acquisition
    const costPerAcquisition = closedDeals > 0 ? totalCost / closedDeals : 0;

    return {
      leadsGenerated,
      closedDeals,
      conversionRate,
      totalRevenue,
      roi,
      costPerLead,
      costPerAcquisition,
    };
  }, [metrics, funnel, monthlySpend, avgDealValue]);

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" />
            <h3 className="font-semibold text-foreground">ROI Summary</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              calculatedMetrics.roi > 0 
                ? "text-emerald-600 bg-emerald-50 border-emerald-200" 
                : "text-red-600 bg-red-50 border-red-200"
            )}
          >
            {calculatedMetrics.roi > 0 ? '+' : ''}{calculatedMetrics.roi.toFixed(0)}% ROI
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold text-foreground">
              ${calculatedMetrics.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Cost/Lead</p>
            <p className="text-lg font-bold text-foreground">
              ${calculatedMetrics.costPerLead.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">ROI Calculator</h3>
            <p className="text-sm text-muted-foreground">Track your return on investment</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
          className="gap-2"
        >
          <RefreshCw className="size-4" />
          {showCustom ? 'Hide' : 'Customize'}
        </Button>
      </div>

      {/* Custom Inputs */}
      {showCustom && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="monthlySpend" className="text-sm font-medium">
              Monthly Subscription Cost
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                id="monthlySpend"
                type="number"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealValue" className="text-sm font-medium">
              Average Deal Value
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                id="dealValue"
                type="number"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value))}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      )}

      {/* ROI Highlight */}
      <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Return on Investment</p>
            <p className="text-4xl font-bold">
              {calculatedMetrics.roi > 0 ? '+' : ''}{calculatedMetrics.roi.toFixed(0)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Total Revenue</p>
            <p className="text-2xl font-bold">
              ${calculatedMetrics.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="size-5" />}
          label="Leads Generated"
          value={calculatedMetrics.leadsGenerated.toLocaleString()}
          color="blue"
        />
        <MetricCard
          icon={<Target className="size-5" />}
          label="Deals Closed"
          value={calculatedMetrics.closedDeals.toLocaleString()}
          color="green"
        />
        <MetricCard
          icon={<DollarSign className="size-5" />}
          label="Cost per Lead"
          value={`$${calculatedMetrics.costPerLead.toFixed(2)}`}
          color="purple"
        />
        <MetricCard
          icon={<TrendingUp className="size-5" />}
          label="Conversion Rate"
          value={`${calculatedMetrics.conversionRate.toFixed(1)}%`}
          color="orange"
        />
      </div>

      {/* AI Insight */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">AI Insight</p>
            <p className="text-xs text-primary">
              {calculatedMetrics.roi > 500
                ? "Exceptional ROI! Your lead qualification is highly effective. Consider scaling up your marketing efforts."
                : calculatedMetrics.roi > 200
                ? "Strong ROI performance. Focus on optimizing your conversion funnel for even better results."
                : calculatedMetrics.roi > 0
                ? "Positive ROI. Consider improving lead quality through better targeting to boost conversions."
                : "ROI needs improvement. Review your lead sources and qualification criteria."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Individual metric card component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const COLOR_MAP = {
  blue: { bg: 'bg-muted/50', text: 'text-info' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-primary/10', text: 'text-primary' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className="p-4 rounded-xl border bg-white">
      <div className={cn("flex size-10 items-center justify-center rounded-lg mb-3", colors.bg, colors.text)}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

// Simple ROI badge for headers
export function ROIBadge({ className }: { className?: string }) {
  const { data: metrics } = useDashboardMetrics();
  const { data: funnel } = useConversionFunnel();

  const roi = useMemo(() => {
    if (!metrics || !funnel) return 0;
    const revenue = (funnel.closedWon || 0) * 2500; // Assume avg deal value
    const cost = 99; // Assume base subscription
    return cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
  }, [metrics, funnel]);

  return (
    <Badge 
      className={cn(
        roi > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700",
        className
      )}
    >
      {roi > 0 ? '+' : ''}{roi.toFixed(0)}% ROI
    </Badge>
  );
}

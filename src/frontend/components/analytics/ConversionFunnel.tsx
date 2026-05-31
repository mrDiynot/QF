'use client';

/**
 * Conversion Funnel Chart Component
 * Visualizes the lead-to-customer conversion pipeline
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, Target, Phone, Calendar, FileText, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversionFunnel } from '@/hooks/api/useAnalytics';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoff?: number;
  icon: React.ReactNode;
  color: string;
}

const STAGE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  leads: { icon: <Users className="size-4" />, color: 'from-blue-500 to-blue-600' },
  qualified: { icon: <Target className="size-4" />, color: 'from-purple-500 to-purple-600' },
  contacted: { icon: <Phone className="size-4" />, color: 'from-indigo-500 to-indigo-600' },
  appointments: { icon: <Calendar className="size-4" />, color: 'from-cyan-500 to-cyan-600' },
  proposals: { icon: <FileText className="size-4" />, color: 'from-orange-500 to-orange-600' },
  won: { icon: <Trophy className="size-4" />, color: 'from-emerald-500 to-emerald-600' },
};

interface ConversionFunnelProps {
  className?: string;
  showDropoff?: boolean;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ConversionFunnel({ 
  className, 
  showDropoff = true,
  variant = 'default' 
}: ConversionFunnelProps) {
  const { data, isLoading, error } = useConversionFunnel();

  const stages = useMemo(() => {
    if (!data) return [];

    const stageData: FunnelStage[] = [
      { stage: 'Leads Captured', count: data.leadsCaptured || 0, percentage: 100, icon: STAGE_CONFIG.leads.icon, color: STAGE_CONFIG.leads.color },
      { stage: 'Qualified', count: data.qualified || 0, percentage: data.leadsCaptured ? (data.qualified / data.leadsCaptured) * 100 : 0, icon: STAGE_CONFIG.qualified.icon, color: STAGE_CONFIG.qualified.color },
      { stage: 'Contacted', count: data.contacted || 0, percentage: data.leadsCaptured ? (data.contacted / data.leadsCaptured) * 100 : 0, icon: STAGE_CONFIG.contacted.icon, color: STAGE_CONFIG.contacted.color },
      { stage: 'Appointments', count: data.appointments || 0, percentage: data.leadsCaptured ? (data.appointments / data.leadsCaptured) * 100 : 0, icon: STAGE_CONFIG.appointments.icon, color: STAGE_CONFIG.appointments.color },
      { stage: 'Proposals Sent', count: data.proposalsSent || 0, percentage: data.leadsCaptured ? (data.proposalsSent / data.leadsCaptured) * 100 : 0, icon: STAGE_CONFIG.proposals.icon, color: STAGE_CONFIG.proposals.color },
      { stage: 'Closed Won', count: data.closedWon || 0, percentage: data.leadsCaptured ? (data.closedWon / data.leadsCaptured) * 100 : 0, icon: STAGE_CONFIG.won.icon, color: STAGE_CONFIG.won.color },
    ];

    // Calculate dropoff rates
    return stageData.map((stage, idx) => ({
      ...stage,
      dropoff: idx > 0 && stageData[idx - 1].count > 0
        ? ((stageData[idx - 1].count - stage.count) / stageData[idx - 1].count) * 100
        : 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <p className="text-center text-muted-foreground">Failed to load funnel data</p>
      </Card>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Card className={cn("p-6", className)}>
        <h3 className="text-lg font-semibold text-foreground mb-6">Conversion Funnel</h3>
        <div className="flex items-end justify-between gap-2 h-48">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className={cn("w-full rounded-t-lg bg-gradient-to-t", stage.color)}
                style={{ height: `${Math.max(stage.percentage, 5)}%` }}
              />
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-foreground">{stage.count}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-16">{stage.stage}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Conversion Funnel</h3>
        {data && (
          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">
            {((data.closedWon || 0) / (data.leadsCaptured || 1) * 100).toFixed(1)}% overall conversion
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => (
          <div key={idx} className="relative">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={cn(
                "flex size-10 items-center justify-center rounded-lg text-white bg-gradient-to-br",
                stage.color
              )}>
                {stage.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{stage.count.toLocaleString()}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stage.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", stage.color)}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>

                {/* Dropoff indicator */}
                {showDropoff && idx > 0 && stage.dropoff !== undefined && stage.dropoff > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="size-3 text-red-500" />
                    <span className="text-xs text-red-500">
                      {stage.dropoff.toFixed(1)}% dropoff from previous stage
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connector line */}
            {idx < stages.length - 1 && (
              <div className="absolute left-5 top-10 h-3 w-0.5 bg-muted" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// Compact summary for dashboard
export function FunnelSummary({ className }: { className?: string }) {
  const { data, isLoading } = useConversionFunnel();

  if (isLoading || !data) {
    return <Skeleton className={cn("h-24", className)} />;
  }

  const conversionRate = data.leadsCaptured > 0 ? (data.closedWon / data.leadsCaptured) * 100 : 0;

  return (
    <div className={cn("flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50", className)}>
      <div>
        <p className="text-sm text-muted-foreground">Overall Conversion</p>
        <p className="text-2xl font-bold text-primary">{conversionRate.toFixed(1)}%</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Leads → Won</p>
        <p className="text-sm font-medium text-foreground">
          {data.leadsCaptured} → {data.closedWon}
        </p>
      </div>
    </div>
  );
}

'use client';

/**
 * Lead Score Badge Component
 * Visual display of lead qualification score with BANT breakdown
 */

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface BANTScores {
  budget?: number;
  authority?: number;
  need?: number;
  timeline?: number;
}

interface LeadScoreBadgeProps {
  score: number;
  bantScores?: BANTScores;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getScoreConfig = (score: number) => {
  if (score >= 80) {
    return {
      label: 'Hot',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      ringColor: 'stroke-red-500',
      gradient: 'from-red-500 to-orange-500',
    };
  }
  if (score >= 60) {
    return {
      label: 'Warm',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      ringColor: 'stroke-amber-500',
      gradient: 'from-amber-500 to-yellow-500',
    };
  }
  if (score >= 40) {
    return {
      label: 'Cool',
      color: 'text-info',
      bgColor: 'bg-muted/50',
      ringColor: 'stroke-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    };
  }
  return {
    label: 'Cold',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/40',
    ringColor: 'stroke-gray-400',
    gradient: 'from-gray-400 to-gray-500',
  };
};

const SIZE_CONFIG = {
  sm: { wrapper: 'size-8', text: 'text-xs', ring: 24, strokeWidth: 2 },
  md: { wrapper: 'size-12', text: 'text-sm', ring: 40, strokeWidth: 3 },
  lg: { wrapper: 'size-16', text: 'text-lg', ring: 56, strokeWidth: 4 },
};

export function LeadScoreBadge({
  score,
  bantScores,
  size = 'md',
  showLabel = false,
  className,
}: LeadScoreBadgeProps) {
  const config = getScoreConfig(score);
  const sizeConfig = SIZE_CONFIG[size];
  const circumference = 2 * Math.PI * (sizeConfig.ring / 2 - sizeConfig.strokeWidth);
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const badge = (
    <div className={cn("relative inline-flex items-center gap-2", className)}>
      {/* Score Ring */}
      <div className={cn("relative", sizeConfig.wrapper)}>
        <svg
          className="transform -rotate-90"
          width={sizeConfig.ring}
          height={sizeConfig.ring}
        >
          {/* Background ring */}
          <circle
            cx={sizeConfig.ring / 2}
            cy={sizeConfig.ring / 2}
            r={sizeConfig.ring / 2 - sizeConfig.strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            className="text-gray-200"
          />
          {/* Score ring */}
          <circle
            cx={sizeConfig.ring / 2}
            cy={sizeConfig.ring / 2}
            r={sizeConfig.ring / 2 - sizeConfig.strokeWidth}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={config.ringColor}
          />
        </svg>
        {/* Score number */}
        <span className={cn(
          "absolute inset-0 flex items-center justify-center font-bold",
          config.color,
          sizeConfig.text
        )}>
          {score}
        </span>
      </div>

      {/* Label */}
      {showLabel && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-semibold",
          config.bgColor,
          config.color
        )}>
          {config.label}
        </span>
      )}
    </div>
  );

  // If BANT scores are provided, wrap in tooltip
  if (bantScores) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="right" className="w-48 p-3">
            <div className="space-y-2">
              <p className="font-semibold text-sm mb-2">BANT Breakdown</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">💰 Budget</span>
                  <span className="font-medium">{bantScores.budget ?? 0}%</span>
                </div>
                <Progress value={bantScores.budget ?? 0} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">👔 Authority</span>
                  <span className="font-medium">{bantScores.authority ?? 0}%</span>
                </div>
                <Progress value={bantScores.authority ?? 0} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">🎯 Need</span>
                  <span className="font-medium">{bantScores.need ?? 0}%</span>
                </div>
                <Progress value={bantScores.need ?? 0} className="h-1.5" />
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">⏰ Timeline</span>
                  <span className="font-medium">{bantScores.timeline ?? 0}%</span>
                </div>
                <Progress value={bantScores.timeline ?? 0} className="h-1.5" />
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

// Compact inline score display
export function LeadScoreInline({ score, className }: { score: number; className?: string }) {
  const config = getScoreConfig(score);
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      config.bgColor,
      config.color,
      className
    )}>
      <span className={cn("size-1.5 rounded-full bg-gradient-to-r", config.gradient)} />
      {score}
    </span>
  );
}

// Score change indicator
export function LeadScoreChange({ 
  current, 
  previous,
  className 
}: { 
  current: number; 
  previous: number;
  className?: string;
}) {
  const change = current - previous;
  const isPositive = change > 0;
  const isNegative = change < 0;

  if (change === 0) return null;

  return (
    <span className={cn(
      "inline-flex items-center text-xs font-medium",
      isPositive && "text-green-600",
      isNegative && "text-red-600",
      className
    )}>
      {isPositive ? '↑' : '↓'} {Math.abs(change)}
    </span>
  );
}

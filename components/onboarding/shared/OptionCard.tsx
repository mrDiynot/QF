'use client';

/**
 * OptionCard Component
 * Reusable card for selecting options in onboarding wizard
 * Supports locked state for subscription-gated features
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Lock } from 'lucide-react';

interface OptionCardProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  variant?: 'default' | 'recommended' | 'upgrade' | 'locked';
  disabled?: boolean;
  className?: string;
  /** Compact horizontal layout for smaller cards */
  compact?: boolean;
}

export function OptionCard({
  icon,
  emoji,
  title,
  subtitle,
  selected,
  onClick,
  badge,
  variant = 'default',
  disabled = false,
  className,
  compact = false,
}: OptionCardProps) {
  const isLocked = variant === 'locked' || disabled;

  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={cn(
        'group relative rounded-xl border-2 transition-all duration-300 ease-out cursor-pointer overflow-hidden',
        // Layout based on compact prop
        compact
          ? 'flex items-center gap-3 p-3 text-left'
          : 'flex flex-col items-center gap-3 rounded-2xl p-6 text-center',
        // Default state with hover effects
        variant === 'default' && !selected && !isLocked &&
          'border-border bg-white hover:border-primary hover:bg-gradient-to-br hover:from-orange-50/80 hover:to-purple-50/50 hover:shadow-md hover:-translate-y-0.5',
        // Selected state - vibrant with glow effect
        selected && !isLocked &&
          'border-primary bg-gradient-to-br from-orange-50 via-white to-purple-50 shadow-lg shadow-brand ring-1 ring-primary/30',
        // Recommended variant
        variant === 'recommended' && !selected && !isLocked &&
          'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400 hover:shadow-md',
        // Upgrade variant
        variant === 'upgrade' && !selected && !isLocked &&
          'border-primary/20 bg-gradient-to-br from-purple-50 to-indigo-50 hover:border-purple-300 hover:shadow-md',
        // Locked/Disabled state
        isLocked && 'opacity-60 cursor-not-allowed border-border bg-muted/20',
        className
      )}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-muted/40/40 backdrop-blur-[0.5px] z-20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground/60" />
        </div>
      )}
      {/* Animated gradient background on selection */}
      {selected && !isLocked && (
        <div className="absolute inset-0 gradient-brand-subtle animate-pulse" />
      )}

      {/* Selected checkmark with animation */}
      {!isLocked && (
        <div className={cn(
          'absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-brand flex items-center justify-center shadow-lg transition-all duration-300 ease-out z-30',
          selected
            ? 'scale-100 opacity-100 rotate-0'
            : 'scale-0 opacity-0 rotate-180'
        )}>
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Sparkle effect on selected */}
      {selected && !isLocked && (
        <div className="absolute top-2 left-2 text-primary animate-bounce z-10">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {badge && (
        <div className={cn(
          "absolute z-30",
          compact ? "right-2 top-2" : "right-3 top-3"
        )}>
          {badge}
        </div>
      )}

      {emoji && (
        <div className={cn(
          'leading-none transition-all duration-300 ease-out relative z-10',
          compact ? 'text-[24px]' : 'text-[36px]',
          isLocked ? 'grayscale opacity-50' : selected ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-105'
        )}>
          {emoji}
        </div>
      )}

      {icon && (
        <div className={cn(
          'relative flex items-center justify-center rounded-lg transition-all duration-300 ease-out z-10 shrink-0',
          compact ? 'size-9' : 'size-12 rounded-xl',
          isLocked
            ? 'bg-muted'
            : selected
              ? 'bg-primary/10 shadow-sm'
              : 'bg-muted/40 group-hover:bg-primary/5'
        )}>
          <div className={cn(compact && '[&>svg]:size-4')}>
            {icon}
          </div>
        </div>
      )}

      <div className={cn(
        "flex flex-col relative z-10 min-w-0",
        compact ? "gap-0 flex-1" : "gap-1"
      )}>
        <span className={cn(
          'font-semibold transition-all duration-300',
          compact ? 'text-xs' : 'text-sm',
          isLocked
            ? 'text-muted-foreground/60'
            : selected
              ? 'text-primary'
              : 'text-foreground/80 group-hover:text-primary'
        )}>
          {title}
        </span>
        {subtitle && (
          <span className={cn(
            'font-medium transition-colors duration-300 truncate',
            compact ? 'text-[10px]' : 'text-xs',
            isLocked ? 'text-muted-foreground/60' : selected ? 'text-primary/70' : 'text-muted-foreground group-hover:text-primary/70'
          )}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Selection checkmark for compact mode */}
      {compact && selected && !isLocked && (
        <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Bottom highlight bar on selection (non-compact only) */}
      {!compact && (
        <div className={cn(
          'absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-primary rounded-full transition-all duration-300 ease-out',
          selected && !isLocked ? 'w-16 opacity-100' : 'w-0 opacity-0'
        )} />
      )}
    </button>
  );
}
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Bento Grid Layout System
 * Inspired by Linear, Stripe, and modern SaaS dashboards
 * Variable-sized cards that create visual hierarchy
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid auto-rows-[minmax(220px,auto)] gap-4 sm:gap-5',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Span multiple columns: 1 (default), 2, 3, or 4 */
  colSpan?: 1 | 2 | 3 | 4;
  /** Span multiple rows: 1 (default), 2, 3 */
  rowSpan?: 1 | 2 | 3;
  /** Add gradient glow effect */
  glowEffect?: boolean;
  /** Interactive hover state */
  interactive?: boolean;
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  glowEffect = false,
  interactive = false,
}: BentoCardProps) {
  const colSpanClasses = {
    1: 'sm:col-span-1',
    2: 'sm:col-span-2 lg:col-span-2',
    3: 'sm:col-span-2 lg:col-span-3',
    4: 'sm:col-span-2 lg:col-span-4',
  };

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6',
        'bg-white/[0.06] backdrop-blur-md border border-white/10',
        'shadow-lg shadow-black/10',
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        interactive && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:border-white/20',
        className
      )}
    >
      {/* Subtle border highlight on hover */}
      {glowEffect && (
        <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface BentoCardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function BentoCardHeader({ icon, title, subtitle, action }: BentoCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/15">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-purple-300">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

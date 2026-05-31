'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SimulatorStatCardProps {
  icon: ReactNode;
  iconBgColor?: string;
  value: string | number;
  label: string;
  loading?: boolean;
  darkMode?: boolean;
  className?: string;
}

/**
 * SimulatorStatCard Component
 * 
 * A themed stat card for the simulator dashboard following Dashcode v1.2.0 patterns.
 * Supports both light and dark modes with consistent styling.
 * 
 * @example
 * ```tsx
 * <SimulatorStatCard
 *   icon={<Activity className="w-5 h-5 text-violet-400" />}
 *   iconBgColor="bg-muted/300/20"
 *   value={stats.activeSessions}
 *   label="Active Sessions"
 *   loading={isLoading}
 *   darkMode={darkMode}
 * />
 * ```
 */
export function SimulatorStatCard({
  icon,
  iconBgColor = 'bg-muted/300/20',
  value,
  label,
  loading = false,
  darkMode = true,
  className,
}: SimulatorStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all hover:shadow-md',
        darkMode
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', iconBgColor)}>
          {icon}
        </div>
        <div>
          <p
            className={cn(
              'text-3xl font-bold tracking-tight',
              darkMode ? 'text-white' : 'text-slate-900'
            )}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : typeof value === 'number' ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              darkMode ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * SimulatorStatsGrid Component
 * 
 * A grid container for SimulatorStatCard components.
 * Automatically handles responsive layout.
 */
interface SimulatorStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function SimulatorStatsGrid({
  children,
  columns = 4,
  className,
}: SimulatorStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

export default SimulatorStatCard;


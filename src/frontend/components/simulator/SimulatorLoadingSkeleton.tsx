'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * SimulatorLoadingSkeleton Component
 * 
 * A loading skeleton for lazy-loaded simulator components.
 * Provides visual feedback while components are being loaded.
 */
interface SimulatorLoadingSkeletonProps {
  darkMode?: boolean;
  height?: string;
  message?: string;
  className?: string;
}

export function SimulatorLoadingSkeleton({
  darkMode = true,
  height = 'h-96',
  message = 'Loading...',
  className,
}: SimulatorLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border animate-pulse',
        height,
        darkMode
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-slate-100 border-slate-200',
        className
      )}
    >
      <Loader2
        className={cn(
          'w-8 h-8 animate-spin mb-3',
          darkMode ? 'text-violet-400' : 'text-primary'
        )}
      />
      <p
        className={cn(
          'text-sm font-medium',
          darkMode ? 'text-slate-400' : 'text-slate-600'
        )}
      >
        {message}
      </p>
    </div>
  );
}

/**
 * SimulatorPageSkeleton Component
 * 
 * A full-page loading skeleton for simulator pages.
 */
interface SimulatorPageSkeletonProps {
  darkMode?: boolean;
  title?: string;
}

export function SimulatorPageSkeleton({
  darkMode = true,
  title = 'Loading simulator...',
}: SimulatorPageSkeletonProps) {
  return (
    <div
      className={cn(
        'min-h-screen p-6',
        darkMode ? 'bg-slate-950' : 'bg-slate-50'
      )}
    >
      {/* Header skeleton */}
      <div className="mb-8">
        <div
          className={cn(
            'h-8 w-64 rounded-lg animate-pulse mb-2',
            darkMode ? 'bg-slate-800' : 'bg-slate-200'
          )}
        />
        <div
          className={cn(
            'h-4 w-96 rounded-lg animate-pulse',
            darkMode ? 'bg-slate-800/50' : 'bg-slate-200/50'
          )}
        />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimulatorLoadingSkeleton
          darkMode={darkMode}
          height="h-[500px]"
          message={title}
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-24 rounded-xl animate-pulse',
                darkMode ? 'bg-slate-800/50' : 'bg-slate-200/50'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SimulatorLoadingSkeleton;


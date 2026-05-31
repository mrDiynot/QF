import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  className,
  ...props
}: SkeletonLoaderProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="shimmer h-4 rounded bg-muted"
            style={{ width: i === lines - 1 ? '80%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-2xl border border-border/50 bg-white p-6', className)} {...props}>
        <div className="flex items-start justify-between mb-6">
          <div className="shimmer size-12 rounded-xl bg-muted" />
          <div className="shimmer h-6 w-16 rounded-full bg-muted" />
        </div>
        <div className="shimmer h-8 w-24 rounded bg-muted mb-2" />
        <div className="shimmer h-4 w-32 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'shimmer bg-muted',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded',
        variant === 'text' && 'h-4 rounded',
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}
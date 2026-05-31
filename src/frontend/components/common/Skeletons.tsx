'use client';

/**
 * Loading Skeleton Components
 * Placeholder components for loading states
 */

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Base skeleton element
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded bg-muted", className)} style={style} />
  );
}

// Text skeleton
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-8', md: 'size-10', lg: 'size-12' };
  return <Skeleton className={cn("rounded-full", sizes[size])} />;
}

// Card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start gap-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonText lines={2} />
      </div>
    </Card>
  );
}

// Stat card skeleton
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <Skeleton className="size-10 rounded-xl" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-32" : i === columns - 1 ? "w-20" : "w-24")}
        />
      ))}
    </div>
  );
}

// Table skeleton
export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </Card>
  );
}

// List item skeleton
export function SkeletonListItem({ hasAvatar = true }: { hasAvatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {hasAvatar && <SkeletonAvatar size="sm" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

// List skeleton
export function SkeletonList({ items = 5, hasAvatar = true }: { items?: number; hasAvatar?: boolean }) {
  return (
    <div className="divide-y">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem key={i} hasAvatar={hasAvatar} />
      ))}
    </div>
  );
}

// Form skeleton
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

// Chart skeleton
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </Card>
  );
}

// Dashboard skeleton (combines multiple)
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

// Conversation skeleton
export function SkeletonConversation() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}
        >
          {i % 2 === 0 && <SkeletonAvatar size="sm" />}
          <div className={cn("space-y-1", i % 2 === 0 ? "items-start" : "items-end")}>
            <Skeleton className={cn("h-16 rounded-xl", i % 2 === 0 ? "w-48" : "w-36")} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Profile skeleton
export function SkeletonProfile() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <SkeletonForm fields={3} />
    </Card>
  );
}

// Calendar skeleton
export function SkeletonCalendar() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

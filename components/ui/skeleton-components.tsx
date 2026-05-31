'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enterprise-grade skeleton loading components
 * Provides consistent loading states across the application
 */

// ============================================================================
// CARD SKELETONS
// ============================================================================

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  className, 
  showHeader = true, 
  showFooter = false,
  lines = 3 
}: SkeletonCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")} 
          />
        ))}
      </div>
      {showFooter && (
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// METRIC CARD SKELETON
// ============================================================================

interface SkeletonMetricCardProps {
  className?: string;
}

export function SkeletonMetricCard({ className }: SkeletonMetricCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function SkeletonTable({ 
  className, 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: SkeletonTableProps) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {showHeader && (
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={cn("h-4", i === 0 ? "w-32" : "w-24")} 
              />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-40" : colIndex === columns - 1 ? "w-20" : "w-28"
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LIST SKELETON
// ============================================================================

interface SkeletonListProps {
  className?: string;
  items?: number;
  showAvatar?: boolean;
  showAction?: boolean;
}

export function SkeletonList({ 
  className, 
  items = 5,
  showAvatar = true,
  showAction = false 
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showAction && <Skeleton className="h-8 w-20" />}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// FORM SKELETON
// ============================================================================

interface SkeletonFormProps {
  className?: string;
  fields?: number;
  showSubmit?: boolean;
}

export function SkeletonForm({ 
  className, 
  fields = 4,
  showSubmit = true 
}: SkeletonFormProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showSubmit && (
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard lines={6} showFooter />
        </div>
        <div>
          <SkeletonList items={4} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONVERSATION SKELETON
// ============================================================================

interface SkeletonConversationProps {
  className?: string;
  messages?: number;
}

export function SkeletonConversation({ 
  className, 
  messages = 5 
}: SkeletonConversationProps) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {Array.from({ length: messages }).map((_, i) => {
        const isUser = i % 2 === 1;
        return (
          <div 
            key={i} 
            className={cn("flex gap-3", isUser && "flex-row-reverse")}
          >
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className={cn("space-y-2 max-w-[70%]", isUser && "items-end")}>
              <Skeleton className={cn("h-4", isUser ? "w-32" : "w-48")} />
              <Skeleton 
                className={cn(
                  "h-16 rounded-xl",
                  isUser ? "w-48" : "w-64"
                )} 
              />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// PROFILE SKELETON
// ============================================================================

interface SkeletonProfileProps {
  className?: string;
}

export function SkeletonProfile({ className }: SkeletonProfileProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Avatar and Name */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Details */}
      <SkeletonForm fields={3} showSubmit={false} />
    </div>
  );
}

// ============================================================================
// PRICING CARD SKELETON
// ============================================================================

interface SkeletonPricingCardProps {
  className?: string;
}

export function SkeletonPricingCard({ className }: SkeletonPricingCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-baseline gap-1">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// ============================================================================
// CHANNEL CARD SKELETON
// ============================================================================

interface SkeletonChannelCardProps {
  className?: string;
}

export function SkeletonChannelCard({ className }: SkeletonChannelCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 flex items-center gap-4", className)}>
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

// ============================================================================
// SUBSCRIPTION CARD SKELETON (for sidebar)
// ============================================================================

interface SkeletonSubscriptionCardProps {
  className?: string;
}

export function SkeletonSubscriptionCard({ className }: SkeletonSubscriptionCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 animate-pulse",
      className
    )}>
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg bg-white/20" />
          <Skeleton className="h-3 w-20 bg-white/20" />
        </div>
        <Skeleton className="h-4 w-32 bg-white/20" />
        <Skeleton className="h-9 w-full rounded-lg bg-white/20" />
      </div>
    </div>
  );
}

const SkeletonComponents = {
  SkeletonCard,
  SkeletonMetricCard,
  SkeletonTable,
  SkeletonList,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonConversation,
  SkeletonProfile,
  SkeletonPricingCard,
  SkeletonChannelCard,
  SkeletonSubscriptionCard,
};

export default SkeletonComponents;

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, CreditCard, ArrowUpCircle, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Subscription, SubscriptionUsage } from '@/types/api';

interface SubscriptionPopoverProps {
  subscription: Subscription | null | undefined;
  usage: SubscriptionUsage | null | undefined;
  isLoadingSubscription: boolean;
  isLoadingUsage: boolean;
  collapsed: boolean;
}

export function SubscriptionPopover({
  subscription,
  usage,
  isLoadingSubscription,
  isLoadingUsage,
  collapsed,
}: SubscriptionPopoverProps) {
  const [open, setOpen] = useState(false);

  const planName = subscription?.planName || 'Free Plan';
  const isPaidPlan = planName?.toLowerCase().includes('smart') ||
                     planName?.toLowerCase().includes('ultra') ||
                     planName?.toLowerCase().includes('enterprise') || false;

  const status = subscription?.status || 'active';
  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  // Loading skeleton
  if (isLoadingSubscription) {
    return (
      <div className={cn(
        "animate-pulse rounded-lg bg-purple-100",
        collapsed ? "size-10" : "h-10"
      )} />
    );
  }

  const triggerContent = (
    <button
      className={cn(
        "w-full flex items-center gap-2 rounded-lg border transition-all cursor-pointer",
        isPaidPlan
          ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 hover:border-purple-400 hover:from-purple-100 hover:to-indigo-100"
          : "bg-purple-50/50 border-purple-200 hover:border-purple-300 hover:bg-purple-50",
        collapsed ? "justify-center size-10 p-0" : "px-2 py-1.5"
      )}
    >
      <div className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        isPaidPlan ? "bg-gradient-to-br from-[#1a0a2e] to-[#2d1b4e]" : "bg-[#1a0a2e]/60",
        collapsed ? "size-5" : "size-6"
      )}>
        <Zap className={cn("text-white", collapsed ? "size-3" : "size-3.5")} />
      </div>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className={cn(
              "text-xs font-semibold truncate",
              isPaidPlan ? "text-[#1a0a2e]" : "text-[#1a0a2e]/70"
            )}>
              {planName}
            </p>
          </div>
          <ChevronRight className="size-3.5 text-[#1a0a2e]/40" />
        </>
      )}
    </button>
  );

  const popoverContent = (
    <div className="w-72 p-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            isPaidPlan ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gray-400"
          )}>
            <Zap className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{planName}</p>
            <Badge 
              variant={status === 'active' ? 'default' : 'secondary'}
              className={cn(
                "text-[10px] h-4",
                status === 'active' && "bg-green-100 text-green-700 hover:bg-green-100"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>
        {!isPaidPlan && (
          <Link
            href="/pricing"
            className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-md hover:from-purple-700 hover:to-indigo-700 transition-colors"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Usage Stats */}
      {!isLoadingUsage && usage && (
        <div className="py-3 space-y-2.5 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usage This Period</p>
          {usage.aiInteractions && <UsageBar label="AI Interactions" {...usage.aiInteractions} />}
          {usage.voiceMinutes && <UsageBar label="Voice Minutes" {...usage.voiceMinutes} />}
          {usage.smsMessages && <UsageBar label="SMS Messages" {...usage.smsMessages} />}
          {usage.teamMembers && <UsageBar label="Team Members" {...usage.teamMembers} />}
        </div>
      )}

      {/* Period Info */}
      {periodEnd && (
        <div className="py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="size-3.5 text-gray-400" />
            <span>Renews: {periodEnd}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-3 space-y-1">
        {isPaidPlan ? (
          <>
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CreditCard className="size-4" />
              <span>Billing & Invoices</span>
            </Link>
            <Link
              href="/settings/subscription"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Activity className="size-4" />
              <span>Manage Subscription</span>
            </Link>
          </>
        ) : (
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ArrowUpCircle className="size-4" />
            <span>Upgrade to Pro</span>
          </Link>
        )}
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <PopoverTrigger asChild>
              <TooltipTrigger asChild>
                {triggerContent}
              </TooltipTrigger>
            </PopoverTrigger>
            <TooltipContent side="right" sideOffset={12}>
              {planName}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={12} className="p-0">
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

// Usage bar component - handles undefined values gracefully
function UsageBar({ label, used, limit, percentage }: {
  label: string;
  used?: number;
  limit?: number;
  percentage?: number;
}) {
  // Handle undefined values
  const safeUsed = used ?? 0;
  const safeLimit = limit ?? 0;
  const safePercentage = percentage ?? 0;

  const isNearLimit = safePercentage >= 80;
  const isOverLimit = safePercentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className={cn(
          "font-medium",
          isOverLimit ? "text-red-600" : isNearLimit ? "text-amber-600" : "text-gray-700"
        )}>
          {safeUsed.toLocaleString()} / {safeLimit.toLocaleString()}
        </span>
      </div>
      <Progress
        value={Math.min(safePercentage, 100)}
        className={cn(
          "h-1.5",
          isOverLimit ? "[&>div]:bg-red-500" : isNearLimit ? "[&>div]:bg-amber-500" : ""
        )}
      />
    </div>
  );
}


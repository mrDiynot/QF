'use client';

import { Zap } from 'lucide-react';
import { useWorkflowLimits } from '@/hooks/subscriptions/useWorkflowLimits';
import { cn } from '@/lib/utils';

export function WorkflowLimitIndicator({ className }: { className?: string }) {
  const { data: limits, isLoading } = useWorkflowLimits();

  if (isLoading || !limits) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Zap className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (limits.isUnlimited) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Zap className="h-4 w-4 text-green-600" />
        <span className="text-muted-foreground">
          {limits.currentWorkflows} workflow{limits.currentWorkflows !== 1 ? 's' : ''}
        </span>
        <span className="text-green-600 font-medium">Unlimited</span>
      </div>
    );
  }

  const color = limits.isAtLimit 
    ? 'text-red-600' 
    : limits.isNearLimit 
    ? 'text-orange-600' 
    : 'text-muted-foreground';

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Zap className={cn('h-4 w-4', color)} />
      <span className="text-muted-foreground">
        {limits.currentWorkflows} / {limits.maxWorkflows} workflows
      </span>
      {limits.remainingWorkflows > 0 && (
        <span className={color}>
          ({limits.remainingWorkflows} remaining)
        </span>
      )}
      {limits.isAtLimit && (
        <span className="text-red-600 font-medium">Limit reached</span>
      )}
    </div>
  );
}

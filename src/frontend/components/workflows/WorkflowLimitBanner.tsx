'use client';

import { AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useWorkflowLimits } from '@/hooks/subscriptions/useWorkflowLimits';
import Link from 'next/link';

export function WorkflowLimitBanner() {
  const { data: limits, isLoading } = useWorkflowLimits();

  if (isLoading || !limits) return null;

  // Don't show banner if unlimited or plenty of space
  if (limits.isUnlimited || limits.usagePercentage < 50) return null;

  const variant = limits.isAtLimit ? 'destructive' : limits.isNearLimit ? 'default' : 'default';
  const icon = limits.isAtLimit ? AlertCircle : limits.isNearLimit ? TrendingUp : Zap;
  const Icon = icon;

  return (
    <Alert variant={variant} className="mb-6">
      <Icon className="h-4 w-4" />
      <AlertTitle>
        {limits.isAtLimit ? 'Workflow Limit Reached' : 'Approaching Workflow Limit'}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span>
              {limits.currentWorkflows} of {limits.maxWorkflows} workflows used
            </span>
            <span className="font-medium">{Math.round(limits.usagePercentage)}%</span>
          </div>
          <Progress value={limits.usagePercentage} className="h-2" />
        </div>
        
        {limits.isAtLimit ? (
          <div className="flex items-center gap-3">
            <p className="text-sm flex-1">
              You&apos;ve reached your plan&apos;s workflow limit. Upgrade to create more workflows and unlock advanced automation features.
            </p>
            <Button asChild size="sm">
              <Link href="/settings/billing">Upgrade Plan</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm flex-1">
              You have {limits.remainingWorkflows} workflow{limits.remainingWorkflows !== 1 ? 's' : ''} remaining. 
              Consider upgrading for unlimited workflows.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/billing">View Plans</Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

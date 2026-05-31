'use client';

/**
 * Workflow Limits Hook
 * Provides workflow count limits and enforcement based on subscription tier
 */

import { useQuery } from '@tanstack/react-query';
import { useCurrentSubscription } from './useSubscriptions';
import { useWorkflows } from '../workflows/useWorkflows';
import { queryConfig } from '@/lib/query-config';

export interface WorkflowLimits {
  maxWorkflows: number;
  currentWorkflows: number;
  remainingWorkflows: number;
  isUnlimited: boolean;
  canCreateMore: boolean;
  usagePercentage: number;
  isNearLimit: boolean; // 80% or more
  isAtLimit: boolean; // 100%
}

/**
 * Get workflow limits for the current subscription
 */
export function useWorkflowLimits() {
  const { data: subscription } = useCurrentSubscription();
  const { data: workflows } = useWorkflows();

  return useQuery({
    queryKey: ['workflow-limits', subscription?.planName],
    queryFn: (): WorkflowLimits => {
      const planName = subscription?.planName?.toLowerCase() || 'freeflow';

      // Define workflow limits per plan (aligned with Figma specification)
      const limits: Record<string, number> = {
        'freeflow': 0,  // View only - cannot activate workflows
        'free flow': 0,
        'smartflow': 5,
        'smart flow': 5,
        'ultraflow': 20,
        'ultra flow': 20,
        'enterprise': Number.MAX_SAFE_INTEGER,
      };

      // Get max workflows for current plan
      let maxWorkflows = limits['trial']; // default
      for (const [key, value] of Object.entries(limits)) {
        if (planName.includes(key)) {
          maxWorkflows = value;
          break;
        }
      }

      const isUnlimited = maxWorkflows === Number.MAX_SAFE_INTEGER;
      const currentWorkflows = workflows?.length || 0;
      const remainingWorkflows = isUnlimited ? Number.MAX_SAFE_INTEGER : Math.max(0, maxWorkflows - currentWorkflows);
      const usagePercentage = isUnlimited ? 0 : Math.min(100, (currentWorkflows / maxWorkflows) * 100);
      const canCreateMore = isUnlimited || currentWorkflows < maxWorkflows;
      const isNearLimit = !isUnlimited && usagePercentage >= 80;
      const isAtLimit = !isUnlimited && currentWorkflows >= maxWorkflows;

      return {
        maxWorkflows,
        currentWorkflows,
        remainingWorkflows,
        isUnlimited,
        canCreateMore,
        usagePercentage,
        isNearLimit,
        isAtLimit,
      };
    },
    enabled: !!subscription,
    ...queryConfig.standard, // Recalculates based on other queries
  });
}

/**
 * Get formatted workflow limit display text
 */
export function useWorkflowLimitDisplay() {
  const { data: limits } = useWorkflowLimits();

  if (!limits) return null;

  if (limits.isUnlimited) {
    return {
      text: `${limits.currentWorkflows} workflows`,
      subtext: 'Unlimited',
      color: 'text-green-600',
    };
  }

  const color = limits.isAtLimit 
    ? 'text-red-600' 
    : limits.isNearLimit 
    ? 'text-orange-600' 
    : 'text-gray-600';

  return {
    text: `${limits.currentWorkflows} / ${limits.maxWorkflows} workflows`,
    subtext: `${limits.remainingWorkflows} remaining`,
    color,
    percentage: limits.usagePercentage,
  };
}

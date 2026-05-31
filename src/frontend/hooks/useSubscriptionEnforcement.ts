/**
 * Subscription Enforcement Hook
 * Checks feature access and usage limits against subscription plan
 *
 * UPDATED: Now uses database-driven feature access from useFeatureAccess hook
 * instead of hardcoded PLAN_FEATURES and PLAN_LIMITS
 */

import { useQuery } from '@tanstack/react-query';
import { useFeatureAccess as useFeatureAccessDB, requiresUpgrade } from '@/hooks/subscriptions/useFeatureAccess';
import { useCurrentSubscription } from '@/hooks/subscriptions/useSubscriptions';
import { subscriptionsService } from '@/services/api/subscriptions.service';

export type PlanTier = 'freeflow' | 'smartflow' | 'ultraflow' | 'enterprise';

export interface SubscriptionStatus {
  planTier: PlanTier;
  planName: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

export interface UsageStats {
  currentChannelsCount: number;
  currentPhoneNumbersCount: number;
  currentSeatsCount: number;
  currentLeadsCount: number;
  currentCrmContactsCount: number;
  currentWorkflowsCount: number;
  currentAiVoiceAgentsCount: number;
  monthlyMessagesCount: number;
  monthlyAiConversationsCount: number;
  monthlyAiSmsCount: number;
  monthlyAiVoiceMinutes: number;
  monthlyApiCallsCount: number;
  storageUsedGB: number;
  knowledgeBaseStorageMB: number;
}

export interface FeatureCheck {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentPlan?: string;
  requiredPlan?: string;
}

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  percentage: number;
  reason?: string;
  upgradeRequired?: boolean;
}

/**
 * Main subscription enforcement hook
 * Uses database-driven feature access instead of hardcoded limits
 */
export function useSubscriptionEnforcement() {
  // Use database-driven subscription and feature access
  const { data: subscription } = useCurrentSubscription();
  const featureAccess = useFeatureAccessDB();

  // Default empty usage stats
  const defaultUsage: UsageStats = {
    currentChannelsCount: 0,
    currentPhoneNumbersCount: 0,
    currentSeatsCount: 0,
    currentLeadsCount: 0,
    currentCrmContactsCount: 0,
    currentWorkflowsCount: 0,
    currentAiVoiceAgentsCount: 0,
    monthlyMessagesCount: 0,
    monthlyAiConversationsCount: 0,
    monthlyAiSmsCount: 0,
    monthlyAiVoiceMinutes: 0,
    monthlyApiCallsCount: 0,
    storageUsedGB: 0,
    knowledgeBaseStorageMB: 0,
  };

  // Fetch usage stats from API using subscriptions service
  const { data: usage } = useQuery<UsageStats>({
    queryKey: ['subscription', 'usage'],
    queryFn: async () => {
      try {
        const response = await subscriptionsService.getUsage();
        return response as unknown as UsageStats;
      } catch {
        // Return default empty usage on error
        return defaultUsage;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: false, // Don't retry on failure
  });

  const planTier = (subscription?.planName?.toLowerCase().replace(/\s+/g, '') || 'freeflow') as PlanTier;

  /**
   * Check if a feature is available in current plan
   * Now uses database-driven feature access
   */
  const hasFeature = (featureKey: string): FeatureCheck => {
    // Use database-driven feature access
    const allowed = featureAccess.hasFeatureAccess(featureKey);

    if (allowed) {
      return { allowed: true };
    }

    // Get required plan from database-driven system
    const requiredPlan = featureAccess.getRequiredPlan(featureKey);

    return {
      allowed: false,
      reason: featureAccess.getUpgradeMessage(featureKey),
      upgradeRequired: true,
      currentPlan: subscription?.planName,
      requiredPlan,
    };
  };

  /**
   * Check if adding a channel is allowed
   * Uses database-driven feature access
   */
  const canAddChannel = (channelType: string): FeatureCheck => {
    // Map channel type to feature key using requiresUpgrade helper
    const featureKey = requiresUpgrade(channelType.toLowerCase());

    if (featureKey) {
      const allowed = featureAccess.hasFeatureAccess(featureKey);
      if (!allowed) {
        return {
          allowed: false,
          reason: featureAccess.getUpgradeMessage(featureKey),
          upgradeRequired: true,
          currentPlan: subscription?.planName,
          requiredPlan: featureAccess.getRequiredPlan(featureKey),
        };
      }
    }

    // TODO: Check channel count limit from subscription.limits
    // For now, allow if feature access is granted
    return { allowed: true };
  };

  /**
   * Check if a usage limit has been reached
   * Uses subscription limits from API
   */
  const checkLimit = (limitKey: string): LimitCheck => {
    // Get limit from subscription
    const limit = subscription?.limits?.[limitKey] ?? 999999;
    
    // Get current usage
    let current = 0;
    switch (limitKey) {
      case 'maxChannels':
      case 'max_channels':
        current = usage?.currentChannelsCount ?? 0;
        break;
      case 'maxPhoneNumbers':
      case 'max_phone_numbers':
        current = usage?.currentPhoneNumbersCount ?? 0;
        break;
      case 'maxSeats':
      case 'max_seats':
        current = usage?.currentSeatsCount ?? 0;
        break;
      case 'maxLeads':
      case 'max_leads':
        current = usage?.currentLeadsCount ?? 0;
        break;
      case 'maxWorkflows':
      case 'max_workflows':
        current = usage?.currentWorkflowsCount ?? 0;
        break;
      case 'maxCrmContacts':
      case 'max_crm_contacts':
        current = usage?.currentCrmContactsCount ?? 0;
        break;
      default:
        current = 0;
    }

    const percentage = limit > 0 ? (current / limit) * 100 : 0;
    const allowed = current < limit;

    return {
      allowed,
      current,
      limit,
      percentage,
      reason: allowed ? undefined : `You have reached your plan limit of ${limit} ${limitKey.replace('max', '').toLowerCase()}`,
      upgradeRequired: !allowed,
    };
  };

  /**
   * Get all limits with current usage
   * TODO: Implement when subscription.limits API is available
   */
  const getAllLimits = (): Record<string, LimitCheck> => {
    // TODO: Get from subscription.limits API
    return {};
  };

  /**
   * Check if plan is in trial
   */
  const isInTrial = subscription?.status === 'trialing';

  /**
   * Check if plan is active
   */
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  /**
   * Get days remaining in trial
   */
  const trialDaysRemaining = subscription?.trialEnd
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    // Subscription info
    subscription,
    usage,
    planTier,
    isInTrial,
    isActive,
    trialDaysRemaining,

    // Feature checks (database-driven)
    hasFeature,
    canAddChannel,
    featureAccess, // Expose the full database-driven feature access

    // Limit checks (TODO: implement with API)
    checkLimit,
    getAllLimits,
  };
}

/**
 * Hook for checking specific feature access
 * DEPRECATED: Use useFeatureAccess from @/hooks/subscriptions/useFeatureAccess directly
 *
 * @deprecated Import useFeatureAccess from @/hooks/subscriptions/useFeatureAccess instead
 */
export function useFeatureAccessLegacy(featureKey: string) {
  const { hasFeature } = useSubscriptionEnforcement();
  return hasFeature(featureKey);
}

/**
 * Hook for checking specific limit
 * TODO: Implement with subscription.limits API
 */
export function useLimitCheck(limitKey: string) {
  const { checkLimit } = useSubscriptionEnforcement();
  return checkLimit(limitKey);
}

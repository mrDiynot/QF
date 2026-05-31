/**
 * Feature Flag System for DashCode Integration
 *
 * Enables gradual rollout of DashCode components with instant rollback capability.
 * Supports user-based, role-based, and percentage-based rollouts.
 *
 * Usage:
 * ```typescript
 * const useDashCodeSidebar = useFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR);
 *
 * return useDashCodeSidebar ? <DashCodeSidebar /> : <OriginalSidebar />;
 * ```
 */

import { UserRole } from '@/types/auth';

/**
 * Available feature flags for DashCode integration
 */
export enum FeatureFlag {
  /** DashCode sidebar navigation (Phase 2) */
  DASHCODE_SIDEBAR = 'dashcode_sidebar',

  /** DashCode React-Table for data tables (Phase 2) */
  DASHCODE_TABLES = 'dashcode_tables',

  /** DashCode dashboard metric cards (Phase 2) */
  DASHCODE_DASHBOARD = 'dashcode_dashboard',

  /** DashCode analytics charts (Phase 3+) */
  DASHCODE_CHARTS = 'dashcode_charts',

  /** Complete DashCode integration (all features) */
  DASHCODE_FULL = 'dashcode_full',

  /** Simplified navigation for Figma redesign */
  SIMPLIFIED_NAVIGATION = 'simplified_navigation',
}

/**
 * Configuration for a feature flag
 */
export interface FeatureFlagConfig {
  /** Whether the feature is enabled at all (master switch) */
  enabled: boolean;

  /** Percentage of users to show feature (0-100) */
  rolloutPercentage: number;

  /** Specific user IDs that always see the feature (for testing) */
  allowedUsers?: string[];

  /** Roles that can see the feature (Owner, Admin, Manager, Viewer) */
  allowedRoles?: UserRole[];

  /** User IDs that should never see the feature (for exclusions) */
  blockedUsers?: string[];

  /** Description of what this flag controls (for documentation) */
  description?: string;
}

/**
 * Feature flag configurations
 *
 * IMPORTANT: All flags start disabled for safety.
 * Enable gradually: allowedUsers → allowedRoles → rolloutPercentage → 100%
 */
export const featureFlags: Record<FeatureFlag, FeatureFlagConfig> = {
  [FeatureFlag.DASHCODE_SIDEBAR]: {
    enabled: false, // DISABLED - using original sidebar
    rolloutPercentage: 0,
    allowedRoles: [],
    description: 'DashCode sidebar navigation replacing custom sidebar',
  },

  [FeatureFlag.DASHCODE_TABLES]: {
    enabled: true, // ✅ ENABLED for testing
    rolloutPercentage: 100, // Full rollout for all users
    description: 'DashCode React-Table for Leads, Conversations, CRM, etc.',
  },

  [FeatureFlag.DASHCODE_DASHBOARD]: {
    enabled: true, // ✅ ENABLED for testing
    rolloutPercentage: 100, // Full rollout for all users
    description: 'DashCode metric cards on dashboard page',
  },

  [FeatureFlag.DASHCODE_CHARTS]: {
    enabled: true, // ✅ ENABLED for testing
    rolloutPercentage: 100, // Full rollout for all users
    description: 'DashCode chart components for analytics',
  },

  [FeatureFlag.DASHCODE_FULL]: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Complete DashCode integration (all features enabled)',
  },

  [FeatureFlag.SIMPLIFIED_NAVIGATION]: {
    enabled: true, // ✅ ENABLED for Figma redesign
    rolloutPercentage: 100, // Full rollout for all users
    description: 'Simplified navigation for Figma redesign onboarding flow',
  },
};

/**
 * Simple hash function for consistent user-based rollout
 * Same user always gets same result (deterministic)
 */
function hashString(str: string): number {
  if (!str) return 0;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

/**
 * Check if a user should see a feature based on flag configuration
 *
 * Priority order:
 * 1. Blocked users → always false
 * 2. Allowed users → always true
 * 3. Allowed roles → true if user has role
 * 4. Rollout percentage → deterministic based on user ID hash
 *
 * @param flag - The feature flag to check
 * @param userId - User ID (for percentage-based rollout)
 * @param userRole - User role (for role-based access)
 * @returns true if user should see the feature
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string,
  userRole?: UserRole
): boolean {
  const config = featureFlags[flag];

  // Guard: if flag config doesn't exist, return false
  if (!config) {
    console.warn(`[FeatureFlags] Unknown feature flag: ${flag}`);
    return false;
  }

  // Master switch - if disabled, no one sees it
  if (!config.enabled) {
    return false;
  }

  // Check if user is blocked
  if (userId && config.blockedUsers?.includes(userId)) {
    return false;
  }

  // Check if user is in allowed list (for testing/early access)
  if (userId && config.allowedUsers?.includes(userId)) {
    return true;
  }

  // Check if user's role is allowed
  if (userRole && config.allowedRoles?.includes(userRole)) {
    return true;
  }

  // Check rollout percentage (deterministic based on user ID)
  if (config.rolloutPercentage > 0 && userId) {
    const hash = hashString(userId);
    const bucket = hash % 100; // 0-99
    return bucket < config.rolloutPercentage;
  }

  // If no user ID and no role match, don't show feature
  return false;
}

/**
 * Update a feature flag configuration at runtime
 *
 * WARNING: Use with caution in production. Prefer updating the
 * featureFlags object directly in code for better tracking.
 *
 * @param flag - The feature flag to update
 * @param updates - Partial configuration to update
 */
export function updateFeatureFlag(
  flag: FeatureFlag,
  updates: Partial<FeatureFlagConfig>
): void {
  featureFlags[flag] = {
    ...featureFlags[flag],
    ...updates,
  };
}

/**
 * Get current configuration for a feature flag
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig {
  return { ...featureFlags[flag] };
}

/**
 * Get all feature flags and their current states
 * Useful for admin panels or debugging
 */
export function getAllFeatureFlags(): Record<FeatureFlag, FeatureFlagConfig> {
  return { ...featureFlags };
}

/**
 * Rollout plan helpers - common configurations
 */
export const RolloutPlans = {
  /** Phase 2A: Internal testing (dev team only) */
  internalTesting: (userIds: string[]): Partial<FeatureFlagConfig> => ({
    enabled: true,
    rolloutPercentage: 0,
    allowedUsers: userIds,
  }),

  /** Phase 2B: Owner beta testing */
  ownerBeta: (): Partial<FeatureFlagConfig> => ({
    enabled: true,
    rolloutPercentage: 0,
    allowedRoles: ['Owner'],
  }),

  /** Phase 2C: Owner + Admin beta testing */
  adminBeta: (): Partial<FeatureFlagConfig> => ({
    enabled: true,
    rolloutPercentage: 0,
    allowedRoles: ['Owner', 'Admin'],
  }),

  /** Phase 2D: Gradual rollout (10% → 25% → 50% → 100%) */
  gradualRollout: (percentage: 10 | 25 | 50 | 100): Partial<FeatureFlagConfig> => ({
    enabled: true,
    rolloutPercentage: percentage,
  }),

  /** Full rollout to everyone */
  fullRollout: (): Partial<FeatureFlagConfig> => ({
    enabled: true,
    rolloutPercentage: 100,
  }),

  /** Emergency rollback - disable for everyone */
  emergencyRollback: (): Partial<FeatureFlagConfig> => ({
    enabled: false,
    rolloutPercentage: 0,
    allowedUsers: [],
    allowedRoles: [],
  }),
};

/**
 * Example rollout progression for Phase 2:
 *
 * Week 3 (Implementation):
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.internalTesting(['dev-user-1', 'dev-user-2']))
 *
 * Week 4 (Beta Testing):
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.ownerBeta())
 * - Monitor for 3 days
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.adminBeta())
 *
 * Week 5 (Gradual Rollout):
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.gradualRollout(10))
 * - Wait 1-2 days, monitor metrics
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.gradualRollout(25))
 * - Wait 1-2 days, monitor metrics
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.gradualRollout(50))
 * - Wait 1-2 days, monitor metrics
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.fullRollout())
 *
 * Emergency Rollback (if issues):
 * - updateFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR, RolloutPlans.emergencyRollback())
 * - All users immediately see original UI
 */

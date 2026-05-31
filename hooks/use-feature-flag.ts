/**
 * React hook for checking feature flags
 *
 * Usage:
 * ```typescript
 * import { useFeatureFlag } from '@/hooks/use-feature-flag';
 * import { FeatureFlag } from '@/lib/feature-flags';
 *
 * function MyComponent() {
 *   const showDashCodeSidebar = useFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR);
 *
 *   return showDashCodeSidebar ? <DashCodeSidebar /> : <OriginalSidebar />;
 * }
 * ```
 */

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { FeatureFlag, isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Hook to check if a feature flag is enabled for the current user
 *
 * Automatically uses current user's ID and role from session/permissions.
 * Returns true if the feature should be shown, false otherwise.
 *
 * @param flag - The feature flag to check
 * @returns true if feature is enabled for current user
 *
 * @example
 * ```typescript
 * function DashboardLayout() {
 *   const useDashCodeSidebar = useFeatureFlag(FeatureFlag.DASHCODE_SIDEBAR);
 *
 *   return (
 *     <div>
 *       {useDashCodeSidebar ? (
 *         <DashCodeSidebarWrapper />
 *       ) : (
 *         <DashboardSidebar />
 *       )}
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { data: session } = useSession();
  const { role } = usePermissions();

  const isEnabled = useMemo(() => {
    const userId = session?.user?.id;
    return isFeatureEnabled(flag, userId, role ?? undefined);
  }, [flag, session?.user?.id, role]);

  return isEnabled;
}

/**
 * Hook to check multiple feature flags at once
 *
 * Useful when you need to check several flags and want to avoid
 * multiple hook calls.
 *
 * @param flags - Array of feature flags to check
 * @returns Object with flag names as keys and boolean values
 *
 * @example
 * ```typescript
 * function Dashboard() {
 *   const features = useFeatureFlags([
 *     FeatureFlag.DASHCODE_SIDEBAR,
 *     FeatureFlag.DASHCODE_DASHBOARD,
 *     FeatureFlag.DASHCODE_TABLES,
 *   ]);
 *
 *   return (
 *     <div>
 *       {features.dashcode_sidebar && <DashCodeSidebar />}
 *       {features.dashcode_dashboard && <DashCodeDashboard />}
 *       {features.dashcode_tables && <DashCodeTable />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFeatureFlags(
  flags: FeatureFlag[]
): Record<string, boolean> {
  const { data: session } = useSession();
  const { role } = usePermissions();

  const enabledFlags = useMemo(() => {
    const userId = session?.user?.id;
    const result: Record<string, boolean> = {};

    for (const flag of flags) {
      result[flag] = isFeatureEnabled(flag, userId, role ?? undefined);
    }

    return result;
  }, [flags, session?.user?.id, role]);

  return enabledFlags;
}

/**
 * Hook to get all feature flags and their states
 *
 * Useful for admin panels or debugging interfaces where you want to
 * show the current state of all feature flags.
 *
 * @returns Object with all flags and their enabled states
 *
 * @example
 * ```typescript
 * function FeatureFlagAdmin() {
 *   const allFlags = useAllFeatureFlags();
 *
 *   return (
 *     <div>
 *       {Object.entries(allFlags).map(([flag, enabled]) => (
 *         <div key={flag}>
 *           {flag}: {enabled ? 'ON' : 'OFF'}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const { data: session } = useSession();
  const { role } = usePermissions();

  const allFlags = useMemo(() => {
    const userId = session?.user?.id;
    const result: Record<string, boolean> = {};

    // Check all available feature flags
    for (const flag of Object.values(FeatureFlag)) {
      result[flag] = isFeatureEnabled(flag, userId, role ?? undefined);
    }

    return result as Record<FeatureFlag, boolean>;
  }, [session?.user?.id, role]);

  return allFlags;
}

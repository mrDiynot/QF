/**
 * Permissions hook for role-based access control
 * Provides utilities for checking user permissions based on their role
 */

import { useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserRole,
  PermissionKey,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from '@/types/auth';

/**
 * Role hierarchy - higher index = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  Viewer: 0,
  Manager: 1,
  Admin: 2,
  Owner: 3,
};

export interface UsePermissionsReturn {
  /** Current user's role */
  role: UserRole | null;
  /** Check if user has a specific permission */
  hasPermission: (permission: PermissionKey) => boolean;
  /** Check if user has ANY of the specified permissions */
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  /** Check if user has ALL of the specified permissions */
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  /** Check if user's role is at or above the specified role */
  isRoleAtLeast: (minimumRole: UserRole) => boolean;
  /** Check if user is Owner */
  isOwner: boolean;
  /** Check if user is Admin or Owner */
  isAdminOrOwner: boolean;
  /** Check if user is Manager or higher */
  isManagerOrHigher: boolean;
  /** Check if user can manage team members */
  canManageTeam: boolean;
  /** Check if user can manage billing */
  canManageBilling: boolean;
  /** Check if user can manage channels */
  canManageChannels: boolean;
  /** Check if user can manage business settings */
  canManageBusiness: boolean;
  /** Check if user can view audit logs */
  canViewAuditLogs: boolean;
  /** Check if user can manage API keys */
  canManageApiKeys: boolean;
  /** Check if user can manage forms */
  canManageForms: boolean;
  /** Check if user can manage scoring criteria */
  canManageScoringCriteria: boolean;
}

/**
 * Hook for checking user permissions based on their role
 * @returns Permission checking utilities
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: session } = useSession();

  // Get user role from session
  const role = useMemo<UserRole | null>(() => {
    if (!session?.user) return null;
    // The role is stored in the session user object
    return (session.user as { role?: UserRole }).role ?? 'Viewer';
  }, [session]);

  // Get all permissions for the current role
  const permissions = useMemo<PermissionKey[]>(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  // Check if user has ANY of the specified permissions
  const hasAnyPermission = useCallback(
    (perms: PermissionKey[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  // Check if user has ALL of the specified permissions
  const hasAllPermissions = useCallback(
    (perms: PermissionKey[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  // Check if user's role is at or above the specified role
  const isRoleAtLeast = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!role) return false;
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole];
    },
    [role]
  );

  // Computed permission checks
  const isOwner = role === 'Owner';
  const isAdminOrOwner = role === 'Owner' || role === 'Admin';
  const isManagerOrHigher = isRoleAtLeast('Manager');

  // Specific feature permissions
  const canManageTeam = hasPermission(PERMISSIONS.MANAGE_USERS);
  const canManageBilling = hasPermission(PERMISSIONS.MANAGE_BILLING);
  const canManageChannels = hasPermission(PERMISSIONS.MANAGE_CHANNELS);
  const canManageBusiness = hasPermission(PERMISSIONS.MANAGE_BUSINESS);
  const canViewAuditLogs = hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS);

  // API Keys require Owner role (most sensitive)
  const canManageApiKeys = isOwner;

  // Forms require Manager or higher
  const canManageForms = isManagerOrHigher;

  // Scoring criteria requires Admin or Owner
  const canManageScoringCriteria = isAdminOrOwner;

  return {
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRoleAtLeast,
    isOwner,
    isAdminOrOwner,
    isManagerOrHigher,
    canManageTeam,
    canManageBilling,
    canManageChannels,
    canManageBusiness,
    canViewAuditLogs,
    canManageApiKeys,
    canManageForms,
    canManageScoringCriteria,
  };
}

export { PERMISSIONS, ROLE_PERMISSIONS };


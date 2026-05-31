'use client';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionKey, UserRole } from '@/types/auth';

interface PermissionGateProps {
  /** Children to render if permission check passes */
  children: ReactNode;
  /** Fallback content when permission is denied (optional) */
  fallback?: ReactNode;
  /** Required permission (single) */
  permission?: PermissionKey;
  /** Required permissions (must have ALL) */
  permissions?: PermissionKey[];
  /** Required permissions (must have ANY) */
  anyPermission?: PermissionKey[];
  /** Minimum role required */
  minimumRole?: UserRole;
  /** Require Owner role */
  requireOwner?: boolean;
  /** Require Admin or Owner role */
  requireAdminOrOwner?: boolean;
  /** Require Manager or higher role */
  requireManagerOrHigher?: boolean;
}

/**
 * Gate component that conditionally renders children based on permissions
 *
 * @example
 * // Single permission
 * <PermissionGate permission="manage_users">
 *   <InviteButton />
 * </PermissionGate>
 *
 * @example
 * // Minimum role
 * <PermissionGate requireAdminOrOwner>
 *   <AdminPanel />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate permission="manage_billing" fallback={<UpgradePrompt />}>
 *   <BillingSettings />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  fallback = null,
  permission,
  permissions,
  anyPermission,
  minimumRole,
  requireOwner,
  requireAdminOrOwner,
  requireManagerOrHigher,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isRoleAtLeast,
    isOwner,
    isAdminOrOwner,
    isManagerOrHigher,
  } = usePermissions();

  // Check all permission conditions
  let hasAccess = true;

  // Check single permission
  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  // Check all permissions
  if (permissions && !hasAllPermissions(permissions)) {
    hasAccess = false;
  }

  // Check any permission
  if (anyPermission && !hasAnyPermission(anyPermission)) {
    hasAccess = false;
  }

  // Check minimum role
  if (minimumRole && !isRoleAtLeast(minimumRole)) {
    hasAccess = false;
  }

  // Check Owner requirement
  if (requireOwner && !isOwner) {
    hasAccess = false;
  }

  // Check Admin or Owner requirement
  if (requireAdminOrOwner && !isAdminOrOwner) {
    hasAccess = false;
  }

  // Check Manager or higher requirement
  if (requireManagerOrHigher && !isManagerOrHigher) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component for permission-gated components
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  gateProps: Omit<PermissionGateProps, 'children'>
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGate {...gateProps}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}


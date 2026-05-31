/**
 * Permission utilities
 * Functions for checking user permissions based on roles
 */

import { UserRole, ROLE_PERMISSIONS, PermissionKey } from '@/types/auth';

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: PermissionKey): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: PermissionKey[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: PermissionKey[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): PermissionKey[] => {
  return ROLE_PERMISSIONS[role];
};

/**
 * Check if a role is Owner
 */
export const isOwner = (role: UserRole): boolean => {
  return role === 'Owner';
};

/**
 * Check if a role is Admin or Owner
 */
export const isAdminOrOwner = (role: UserRole): boolean => {
  return role === 'Admin' || role === 'Owner';
};

/**
 * Check if a role can manage users
 */
export const canManageUsers = (role: UserRole): boolean => {
  return isAdminOrOwner(role);
};

/**
 * Check if a role can manage billing
 */
export const canManageBilling = (role: UserRole): boolean => {
  return isOwner(role);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  return role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeVariant = (role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (role) {
    case 'Owner':
      return 'default';
    case 'Admin':
      return 'secondary';
    case 'Manager':
      return 'outline';
    case 'Viewer':
      return 'outline';
    default:
      return 'outline';
  }
};
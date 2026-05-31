/**
 * Session utilities
 * Helper functions for accessing session data
 */

import { auth } from '@/lib/auth-utils';

/**
 * Get current business ID from session (server-side)
 */
export async function getCurrentBusinessId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.businessId || null;
}

/**
 * Get current user from session (server-side)
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Get session with tokens (server-side)
 */
export async function getSession() {
  return await auth();
}

/**
 * Get current business ID from session (client-side)
 */
export async function getClientBusinessId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch('/api/auth/session');
    const session = await response.json();
    return session?.user?.businessId || null;
  } catch (error) {
    console.error('[Session] Error fetching business ID:', error);
    return null;
  }
}

/**
 * Check if user has permission
 * @param userRole - The user's role
 * @param permission - The permission to check
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasPermission(userRole: string, permission: string): boolean {
  // Implement permission checking logic based on ROLE_PERMISSIONS
  // This is a placeholder - implement based on your permission system
  return true;
}
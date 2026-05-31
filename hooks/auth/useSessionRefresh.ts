'use client';

/**
 * Session Refresh Hook
 * 
 * Monitors user activity and proactively refreshes the session token
 * to prevent session expiration during active use.
 * 
 * Features:
 * - Tracks user activity (mouse, keyboard, touch, scroll)
 * - Refreshes session 2 minutes before token expiry
 * - Only refreshes if user has been active recently
 * - Prevents unnecessary refreshes during inactivity
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Activity events to monitor
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const;

// How long to consider user "active" after last activity (5 minutes)
const ACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

// How often to check if refresh is needed (30 seconds)
const CHECK_INTERVAL_MS = 30 * 1000;

// Refresh token 2 minutes before expiry
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

interface UseSessionRefreshOptions {
  /** Whether to enable the hook (default: true) */
  enabled?: boolean;
  /** Callback when session is refreshed */
  onRefresh?: () => void;
  /** Callback when session refresh fails */
  onRefreshError?: (error: Error) => void;
}

export function useSessionRefresh(options: UseSessionRefreshOptions = {}) {
  const { enabled = true, onRefresh, onRefreshError } = options;
  const { data: session, update: updateSession } = useSession();
  
  // Track last activity time
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  // Update last activity time on user interaction
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check if user has been active recently
  const isUserActive = useCallback(() => {
    return Date.now() - lastActivityRef.current < ACTIVITY_TIMEOUT_MS;
  }, []);

  // Refresh the session
  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    try {
      console.log('[SessionRefresh] Refreshing session...');
      await updateSession();
      console.log('[SessionRefresh] Session refreshed successfully');
      onRefresh?.();
    } catch (error) {
      console.error('[SessionRefresh] Failed to refresh session:', error);
      onRefreshError?.(error instanceof Error ? error : new Error('Session refresh failed'));
    } finally {
      isRefreshingRef.current = false;
    }
  }, [updateSession, onRefresh, onRefreshError]);

  // Check if session needs refresh
  const checkAndRefresh = useCallback(() => {
    if (!session?.accessTokenExpires) return;
    
    const now = Date.now();
    const expiresAt = session.accessTokenExpires;
    const timeUntilExpiry = expiresAt - now;
    
    // If token expires within threshold and user is active, refresh
    if (timeUntilExpiry < REFRESH_THRESHOLD_MS && timeUntilExpiry > 0 && isUserActive()) {
      console.log('[SessionRefresh] Token expiring soon, user is active - refreshing');
      refreshSession();
    }
  }, [session?.accessTokenExpires, isUserActive, refreshSession]);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up periodic check
    const intervalId = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Initial activity timestamp
    lastActivityRef.current = Date.now();

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [enabled, handleActivity, checkAndRefresh]);

  // Also check on visibility change (user returns to tab)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to tab - update activity and check refresh
        handleActivity();
        checkAndRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, handleActivity, checkAndRefresh]);

  return {
    /** Manually trigger a session refresh */
    refreshSession,
    /** Check if user has been active recently */
    isUserActive,
    /** Last activity timestamp */
    lastActivity: lastActivityRef.current,
  };
}


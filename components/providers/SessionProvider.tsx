'use client';

/**
 * Session Provider
 * Monitors session expiration and handles automatic logout
 *
 * Industry Best Practices:
 * - Subscribes to centralized auth events for coordinated logout
 * - Proactive token refresh before expiry
 * - User activity tracking to prevent logout during active use
 * - Clean session cleanup on logout
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from 'next-auth';
import { authEvents, type AuthEvent } from '@/lib/auth-events';

interface ExtendedSession extends Session {
  error?: string;
  accessTokenExpires?: number;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update: updateSession } = useSession();
  const _router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const lastActivityRef = useRef<number>(Date.now());
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const isLoggingOutRef = useRef(false);

  /**
   * Centralized logout handler
   * Clears all session data and redirects to login
   */
  const handleLogout = useCallback(async (reason?: string, showToast = true) => {
    // Prevent multiple simultaneous logout attempts
    if (isLoggingOutRef.current) {
      console.log('[SessionProvider] Logout already in progress, skipping');
      return;
    }
    isLoggingOutRef.current = true;

    console.log('[SessionProvider] Initiating logout:', reason);

    // Show toast notification
    if (showToast) {
      toast.error(reason || 'Your session has expired. Please sign in again.', {
        duration: 5000,
      });
    }

    // Clear React Query cache to prevent stale data issues
    queryClient.clear();

    // Clear any sessionStorage tokens
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('businessId');
    }

    // Sign out from NextAuth
    try {
      await signOut({ redirect: false });
    } catch (error) {
      console.error('[SessionProvider] SignOut error:', error);
    }

    // Redirect to login with callback URL
    const callbackUrl = encodeURIComponent(pathname);
    const loginUrl = `/login?callbackUrl=${callbackUrl}&session_expired=true`;

    // Use window.location for a full page reload to ensure clean state
    window.location.href = loginUrl;
  }, [pathname, queryClient]);

  /**
   * Subscribe to centralized auth events
   * This handles logout triggers from axios interceptors and other parts of the app
   *
   * IMPORTANT: Admin routes (/admin/*) use their own JWT session system
   * (localStorage-based) and should NOT be affected by NextAuth session events.
   */
  useEffect(() => {
    const unsubscribe = authEvents.subscribe((event: AuthEvent) => {
      // Skip all NextAuth-related session events when on admin routes.
      // Admin pages manage their own session via useAdminSession + adminApiClient.
      if (pathname?.startsWith('/admin')) {
        console.log('[SessionProvider] Ignoring auth event on admin route:', event.type);
        return;
      }

      console.log('[SessionProvider] Auth event received:', event.type);

      switch (event.type) {
        case 'SESSION_EXPIRED':
        case 'TOKEN_REFRESH_FAILED':
        case 'FORCE_LOGOUT':
          handleLogout(event.reason || 'Your session has expired. Please sign in again.');
          break;
        case 'UNAUTHORIZED':
          // Only logout if we're authenticated (prevents loops during login)
          if (status === 'authenticated') {
            handleLogout(event.reason || 'Authentication required. Please sign in again.');
          }
          break;
        case 'SESSION_REFRESHED':
          // Token was refreshed successfully - update session
          updateSession();
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [handleLogout, pathname, status, updateSession]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      setHasShownWarning(false); // Reset warning flag on activity
    };

    // Listen to user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Monitor session for errors and expiration
  useEffect(() => {
    // Skip if not authenticated or already logging out
    if (status !== 'authenticated' || !session || isLoggingOutRef.current) return;

    // Check for session error (token refresh failed)
    const extendedSession = session as ExtendedSession;
    if (extendedSession.error === 'RefreshAccessTokenError') {
      console.warn('[SessionProvider] Session refresh error detected');
      handleLogout('Your session has expired. Please sign in again.');
      return;
    }

    // Check token expiration
    const accessTokenExpires = extendedSession.accessTokenExpires;
    if (!accessTokenExpires) return;

    const timeUntilExpiry = accessTokenExpires - Date.now();

    // If token already expired
    if (timeUntilExpiry <= 0) {
      console.warn('[SessionProvider] Token already expired');
      handleLogout('Your session has expired. Please sign in again.');
      return;
    }

    // Set up warning before expiry (5 minutes before)
    // Only show warning if user has been inactive for at least 2 minutes
    const warningTime = timeUntilExpiry - 5 * 60 * 1000;
    if (warningTime > 0) {
      const warningTimeout = setTimeout(() => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        const inactiveThreshold = 2 * 60 * 1000; // 2 minutes

        // Only show warning if user has been inactive
        if (timeSinceLastActivity >= inactiveThreshold && !hasShownWarning) {
          toast.warning('Your session will expire soon. Please save your work.', {
            duration: 10000,
          });
          setHasShownWarning(true);
        }
      }, warningTime);

      return () => clearTimeout(warningTimeout);
    }
  }, [session, status, handleLogout, hasShownWarning]);

  // Proactive session refresh during active usage
  useEffect(() => {
    if (status !== 'authenticated') return;

    // Refresh session every 5 minutes during active use
    const interval = setInterval(async () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const activeThreshold = 5 * 60 * 1000; // 5 minutes

      // Only refresh if user has been active recently
      if (timeSinceLastActivity < activeThreshold) {
        console.log('[SessionProvider] User active, refreshing session proactively');
        try {
          await updateSession();
        } catch (error) {
          console.error('[SessionProvider] Proactive session refresh failed:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [status, updateSession]);

  // Clear logout flag when session becomes unauthenticated (after successful logout)
  useEffect(() => {
    if (status === 'unauthenticated') {
      isLoggingOutRef.current = false;
    }
  }, [status]);

  return <>{children}</>;
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthService } from '@/services/api/admin.service';
import type { AdminUser, ImpersonationSession } from '@/types/admin';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

// Helper to safely check localStorage (client-side only)
function getAuthStateFromStorage(): { isAuth: boolean; user: AdminUser | null } {
  if (typeof window === 'undefined') {
    return { isAuth: false, user: null };
  }
  try {
    const token = localStorage.getItem('admin_access_token');
    const userStr = localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { isAuth: !!token && !!user, user };
  } catch {
    return { isAuth: false, user: null };
  }
}

export function useAdminSession() {
  const router = useRouter();
  
  // Always start as loading - we'll check localStorage in useEffect
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationSession | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check authentication status on mount (client-side only)
  useEffect(() => {
    const { isAuth, user } = getAuthStateFromStorage();
    setIsAuthenticated(isAuth);
    setAdminUser(user);
    setIsLoading(false);
  }, []);

  // Handle activity tracking for idle timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

  // Check for idle timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkIdleTimeout = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      if (idleTime >= IDLE_TIMEOUT) {
        handleLogout('Session expired due to inactivity');
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkIdleTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, lastActivity]);

  const handleLogout = useCallback(async (reason?: string) => {
    try {
      await adminAuthService.logout();
    } catch {
      // Ignore errors during logout
    } finally {
      setIsAuthenticated(false);
      setAdminUser(null);
      setImpersonation(null);
      router.push(`/admin/login${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await adminAuthService.refreshToken();
      if (response.accessToken) {
        // Token refreshed successfully — update stored tokens
        // The admin.service.ts refreshToken already stores tokens in localStorage
        // Re-read user from storage since profile isn't returned from refresh
        const { user } = getAuthStateFromStorage();
        if (user) {
          setAdminUser(user);
        }
        return true;
      }
      return false;
    } catch {
      await handleLogout('Session expired');
      return false;
    }
  }, [handleLogout]);

  // Derive mustChangePassword from the stored admin user profile
  const mustChangePassword = adminUser?.mustChangePassword ?? false;

  return {
    isLoading,
    isAuthenticated,
    mustChangePassword,
    adminUser,
    impersonation,
    logout: handleLogout,
    refreshSession,
  };
}


/**
 * Authentication hook
 * Provides current user state and authentication utilities
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface CheckSessionResult {
  isAuthenticated: boolean;
  emailConfirmed: boolean;
}

interface UseAuthReturn extends AuthState {
  checkSession: () => Promise<CheckSessionResult>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkSession = useCallback(async (): Promise<CheckSessionResult> => {
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return { isAuthenticated: false, emailConfirmed: false };
    }

    try {
      // Check verification status which also validates the session
      // IMPORTANT: Use direct fetch instead of apiClient to avoid the 401 interceptor
      // which would clear sessionStorage and redirect to login, breaking the registration flow
      const apiUrl = `${config.api.baseUrl}/api/${config.api.version}/auth/verification-status`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const emailConfirmed = data.success;

      // If we get a response, the session is valid
      // Try to get user info from stored data or decode JWT
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        // Update emailConfirmed from the verification status response
        user.emailConfirmed = emailConfirmed;
        // Also update the stored user with new emailConfirmed status
        sessionStorage.setItem('user', JSON.stringify(user));
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      return { isAuthenticated: true, emailConfirmed };
    } catch {
      // Session is invalid, clear tokens
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return { isAuthenticated: false, emailConfirmed: false };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('pendingVerificationEmail');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return {
    ...state,
    checkSession,
    logout,
  };
};


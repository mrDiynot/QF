/**
 * Axios instance configuration
 * Configured with interceptors for authentication and error handling
 *
 * Industry Best Practices Implemented:
 * - Automatic token refresh before expiry (proactive refresh)
 * - Centralized auth event system for logout handling
 * - Request queue during token refresh to prevent race conditions
 * - Transparent retry of failed requests after token refresh
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';
import { triggerSessionExpired, triggerTokenRefreshFailed, triggerSessionRefreshed } from './auth-events';

// Create axios instance with full API URL including version
export const apiClient = axios.create({
  baseURL: `${config.api.baseUrl}/api/${config.api.version}`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Public API client - No authentication required
 * Use this for public endpoints like landing page data, pricing plans, etc.
 */
export const publicApiClient = axios.create({
  baseURL: `${config.api.baseUrl}/api/${config.api.version}`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session cache - populated synchronously from sessionStorage or async from API
let cachedSession: {
  accessToken?: string;
  accessTokenExpires?: number;
  refreshToken?: string;
  error?: string;
  user?: { businessId?: string }
} | null = null;

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false;
let _refreshPromise: Promise<boolean> | null = null;

// Queue of requests waiting for token refresh
let failedRequestQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
function processQueue(success: boolean, error?: Error): void {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (success) {
      resolve(true);
    } else {
      reject(error || new Error('Token refresh failed'));
    }
  });
  failedRequestQueue = [];
}

/**
 * Proactively refresh token if it's about to expire
 * Industry Best Practice: Refresh tokens BEFORE they expire to prevent errors
 */
async function proactiveTokenRefresh(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!cachedSession?.accessToken) return false;

  // Check if token is expiring soon (within 2 minutes)
  const tokenExpiry = cachedSession.accessTokenExpires || 0;
  const timeUntilExpiry = tokenExpiry - Date.now();
  const REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

  if (timeUntilExpiry > REFRESH_THRESHOLD) {
    return true; // Token is still valid, no refresh needed
  }

  console.log('[Axios] Token expiring soon, proactively refreshing...');
  return await refreshSession();
}

/**
 * Refresh the session by fetching from NextAuth
 * NextAuth's JWT callback will handle the actual token refresh
 */
async function refreshSession(): Promise<boolean> {
  if (isRefreshing) {
    // If already refreshing, wait for the existing refresh to complete
    return new Promise((resolve, reject) => {
      failedRequestQueue.push({ resolve, reject });
    }).then(() => true).catch(() => false);
  }

  isRefreshing = true;

  try {
    // Trigger session update in NextAuth (causes JWT callback to run)
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Session fetch failed');
    }

    const session = await response.json();

    // Check for refresh error from NextAuth
    if (session?.error === 'RefreshAccessTokenError') {
      console.error('[Axios] Session has refresh error from NextAuth');
      triggerTokenRefreshFailed('NextAuth refresh failed');
      processQueue(false, new Error('Token refresh failed'));
      return false;
    }

    if (session?.accessToken) {
      cachedSession = session;
      console.log('[Axios] Session refreshed successfully');
      triggerSessionRefreshed();
      processQueue(true);
      return true;
    }

    // No access token in session - treat as expired
    console.error('[Axios] No access token in refreshed session');
    triggerSessionExpired('No access token after refresh');
    processQueue(false, new Error('No access token'));
    return false;
  } catch (error) {
    console.error('[Axios] Session refresh failed:', error);
    triggerTokenRefreshFailed('Network error during refresh');
    processQueue(false, error as Error);
    return false;
  } finally {
    isRefreshing = false;
    _refreshPromise = null;
  }
}

/**
 * Check if the current page is an admin route.
 * Admin routes use a separate localStorage-based JWT system
 * and should NOT participate in NextAuth session polling.
 */
function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin');
}

// Function to fetch and cache session (runs in background)
function fetchAndCacheSession(): void {
  if (typeof window === 'undefined') return;

  // Skip NextAuth session polling on admin routes — admin uses its own JWT system
  if (isAdminRoute()) return;

  fetch('/api/auth/session')
    .then(response => response.json())
    .then(session => {
      // Check for session errors
      if (session?.error === 'RefreshAccessTokenError') {
        console.warn('[Axios] Session error detected during cache refresh');
        triggerSessionExpired('Session error detected');
        return;
      }
      cachedSession = session;
    })
    .catch(error => {
      console.error('[Axios] Error fetching session:', error);
    });
}

// Pre-fetch session on load (non-blocking)
if (typeof window !== 'undefined') {
  fetchAndCacheSession();
  // Refresh session cache more frequently (every 30s) for better token freshness
  setInterval(fetchAndCacheSession, 30000);

  // Proactively refresh token every minute to prevent expiry during active use
  setInterval(() => {
    if (!isAdminRoute()) {
      proactiveTokenRefresh().catch(console.error);
    }
  }, 60000);
}

// Request interceptor - Add auth token and businessId (SYNCHRONOUS to avoid body issues)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // First, check for sessionStorage token (used during onboarding after registration)
      const sessionStorageToken = sessionStorage.getItem('accessToken');

      if (sessionStorageToken && config.headers) {
        config.headers.Authorization = `Bearer ${sessionStorageToken}`;
      } else if (cachedSession?.accessToken && config.headers) {
        // Use cached session
        config.headers.Authorization = `Bearer ${cachedSession.accessToken}`;
      }

      // Add businessId header for multi-tenancy
      if (cachedSession?.user?.businessId && config.headers) {
        config.headers['X-Business-Id'] = cachedSession.user.businessId;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[Axios] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Check if user is in the middle of registration/verification flow.
 * During this flow, we should NOT clear tokens or redirect to login.
 * Supports both OAuth and non-OAuth (credentials) flows.
 */
function isInActiveAuthFlow(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Non-OAuth (credentials) flow: email verification pending
  const pendingEmail = localStorage.getItem('pendingVerificationEmail');
  const hasToken = !!sessionStorage.getItem('accessToken');
  const hasCredentialsFlow = !!pendingEmail && hasToken;
  
  // OAuth flow: user selected plan/company before OAuth redirect
  const hasOAuthPendingPlan = !!localStorage.getItem('oauthPendingPlan');
  const hasOAuthPendingCompanyName = !!localStorage.getItem('oauthPendingCompanyName');
  const hasOAuthFlow = hasOAuthPendingPlan || hasOAuthPendingCompanyName;
  
  // Also check if we're on auth-related pages
  const pathname = window.location.pathname;
  const isOnAuthPage = pathname.includes('/verify-email') || pathname.includes('/oauth/callback');
  
  return hasCredentialsFlow || hasOAuthFlow || isOnAuthPage;
}

// Response interceptor - Handle errors with automatic logout on auth failures
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // ── DEV BYPASS ──────────────────────────────────────────────────────────
    // When the backend is unreachable in a dev environment and the devBypass
    // flag is active, silently return an empty-data response instead of
    // propagating a network error. This lets every hook/component degrade
    // gracefully without any individual patch.
    const isDevBypass =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('devBypass') === 'true';
    const isNetworkError = !error.response; // no response = connection refused
    // Also swallow 401/403 when devBypass is active so the 401 refresh handler
    // and auth-event cascade (triggerSessionExpired) never fire in dev mode.
    const isAuthError =
      error.response?.status === 401 || error.response?.status === 403;
    if (isDevBypass && (isNetworkError || isAuthError)) {
      console.warn(
        '[Axios:devBypass] swallowing error for:',
        error.config?.url,
        isNetworkError ? '(network)' : `(HTTP ${error.response?.status})`
      );
      // Return a fake-200 with null data so callers get response.data === null
      return Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK (devBypass)',
        headers: {},
        config: error.config,
      });
    }
    // ────────────────────────────────────────────────────────────────────────

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      console.log('[Axios] 401 Unauthorized - attempting session refresh');

      // CRITICAL: Don't handle during active auth flow (OAuth or credentials)
      if (isInActiveAuthFlow()) {
        console.log('[Axios] In active auth flow - not clearing tokens or redirecting');
        return Promise.reject(error);
      }

      // Check if we're using sessionStorage token (onboarding flow)
      const sessionStorageToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      const sessionStorageRefreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refreshToken') : null;

      if (sessionStorageToken && sessionStorageRefreshToken) {
        // Try to refresh the token using the refresh token directly with backend
        console.log('[Axios] SessionStorage token expired - attempting direct refresh');
        try {
          const refreshResponse = await axios.post(
            `${config.api.baseUrl}/api/${config.api.version}/auth/refresh-token`,
            { refreshToken: sessionStorageRefreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (refreshResponse.data?.accessToken) {
            console.log('[Axios] Token refreshed successfully via direct call');
            sessionStorage.setItem('accessToken', refreshResponse.data.accessToken);
            if (refreshResponse.data.refreshToken) {
              sessionStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
            }
            triggerSessionRefreshed();

            // Retry the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('[Axios] Direct token refresh failed:', refreshError);
          // Clear sessionStorage tokens and trigger logout
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          triggerSessionExpired('SessionStorage token refresh failed');
          return Promise.reject(error);
        }
      }

      if (sessionStorageToken && !sessionStorageRefreshToken) {
        // No refresh token - trigger session expired
        console.log('[Axios] No refresh token available - triggering session expired');
        sessionStorage.removeItem('accessToken');
        triggerSessionExpired('No refresh token available');
        return Promise.reject(error);
      }

      // Use NextAuth session refresh
      try {
        const refreshed = await refreshSession();

        if (refreshed && cachedSession?.accessToken && originalRequest.headers) {
          console.log('[Axios] Session refreshed via NextAuth - retrying request');
          originalRequest.headers.Authorization = `Bearer ${cachedSession.accessToken}`;
          return apiClient(originalRequest);
        } else {
          // Refresh failed - trigger session expired
          console.error('[Axios] Session refresh failed - triggering logout');
          triggerSessionExpired('Session refresh failed');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('[Axios] Session refresh error:', refreshError);
        triggerSessionExpired('Session refresh error');
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - might also indicate session issues
    if (error.response?.status === 403) {
      console.warn('[Axios] 403 Forbidden response');
      // Don't auto-logout on 403 - it could be a permission issue, not auth
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Apply the same devBypass guard to the public API client
publicApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isDevBypass =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('devBypass') === 'true';
    if (isDevBypass && !error.response) {
      console.warn('[Axios:devBypass] swallowing public network error for:', error.config?.url);
      return Promise.resolve({ data: null, status: 200, statusText: 'OK (devBypass)', headers: {}, config: error.config });
    }
    return Promise.reject(error);
  }
);

/**
 * API error handler utility - Returns user-friendly message
 * Uses centralized api-error module for consistent error handling
 */
export { parseApiError, handleApiError as handleApiErrorAdvanced, ApiError } from './api-error';

import { parseApiError } from './api-error';

/**
 * Simple error message extractor for backward compatibility
 * Returns a user-friendly message suitable for display
 */
export const handleApiError = (error: unknown): string => {
  const apiError = parseApiError(error);
  return apiError.userMessage;
};

/**
 * Get detailed error info for logging (technical details)
 */
export const getErrorDetails = (error: unknown): {
  code: string;
  message: string;
  userMessage: string;
  statusCode?: number;
  details?: Record<string, unknown>;
} => {
  const apiError = parseApiError(error);
  return {
    code: apiError.code,
    message: apiError.message,
    userMessage: apiError.userMessage,
    statusCode: apiError.statusCode,
    details: apiError.details,
  };
};
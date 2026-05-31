'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Clears all auth-related storage to ensure a fresh login state.
 * Best practice: Clear stale data on auth pages to prevent redirect loops and stale state issues.
 * 
 * @param force - If true, clears storage even during pending verification flow
 */
export function clearAuthStorage(force: boolean = false) {
  // Check if user is in the middle of registration/verification flow (credentials or OAuth)
  // If so, DON'T clear their tokens - they need them!
  
  // Non-OAuth (credentials) flow detection
  const pendingVerificationEmail = localStorage.getItem('pendingVerificationEmail');
  const hasToken = !!sessionStorage.getItem('accessToken');
  const hasCredentialsFlow = !!pendingVerificationEmail && hasToken;
  
  // OAuth flow detection (user selected plan before OAuth redirect)
  const hasOAuthPendingPlan = !!localStorage.getItem('oauthPendingPlan');
  const hasOAuthPendingCompanyName = !!localStorage.getItem('oauthPendingCompanyName');
  const hasOAuthFlow = hasOAuthPendingPlan || hasOAuthPendingCompanyName;
  
  if ((hasCredentialsFlow || hasOAuthFlow) && !force) {
    console.log('[ClearAuthStorage] Skipping clear - active flow in progress:', {
      credentialsFlow: hasCredentialsFlow ? pendingVerificationEmail : false,
      oauthFlow: hasOAuthFlow,
    });
    return;
  }

  // Clear sessionStorage - tokens and user data
  // NOTE: Do NOT clear OAuth pending data from localStorage here!
  // That data needs to persist through the OAuth redirect flow.
  const sessionStorageKeys = [
    'accessToken',
    'refreshToken', 
    'user',
    'businessId',
    'confirmedPlanName',
    'channelSetupComplete',
    'pendingCompanyName',
    'pendingPhoneNumber',
  ];
  sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));

  console.log('[ClearAuthStorage] Cleared sessionStorage (NOT localStorage OAuth data)');
}

/**
 * Clears NextAuth session cookies via server-side route.
 * httpOnly cookies can't be cleared client-side, so we use a server route.
 */
export async function clearAuthCookies() {
  try {
    await fetch('/api/auth/clear-session', { method: 'POST' });
    console.log('[Auth] Cleared auth cookies via server');
  } catch (error) {
    console.warn('[Auth] Failed to clear cookies:', error);
  }
}

/**
 * Checks if there's an active registration/verification flow that should be preserved.
 * Supports both OAuth and non-OAuth flows.
 */
function hasActiveVerificationFlow(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for non-OAuth (credentials) registration flow
  const pendingVerificationEmail = localStorage.getItem('pendingVerificationEmail');
  const hasToken = !!sessionStorage.getItem('accessToken');
  const hasCredentialsFlow = !!pendingVerificationEmail && hasToken;
  
  // Check for OAuth flow in progress (user selected a plan before OAuth redirect)
  // These are set on the register page before initiating OAuth
  const hasOAuthPendingPlan = !!localStorage.getItem('oauthPendingPlan');
  const hasOAuthPendingCompanyName = !!localStorage.getItem('oauthPendingCompanyName');
  const hasOAuthFlow = hasOAuthPendingPlan || hasOAuthPendingCompanyName;
  
  return hasCredentialsFlow || hasOAuthFlow;
}

/**
 * Component that clears sessionStorage, localStorage, React Query cache, and auth cookies when mounted.
 * Used on login/register pages to ensure a fresh authentication state.
 * 
 * Best Practices:
 * - Clear stale tokens to prevent API errors
 * - Clear OAuth pending data to prevent redirect loops
 * - Clear React Query cache for fresh data after login
 * - Clear cookies to prevent stale session issues
 * - PRESERVE tokens during active email verification flow
 */
export function ClearSessionOnMount() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;
    hasCleared.current = true;

    // Check if user is in the middle of email verification
    // If so, don't clear anything - they need their registration tokens!
    if (hasActiveVerificationFlow()) {
      console.log('[ClearSessionOnMount] Skipping cleanup - active verification flow detected');
      return;
    }

    // Clear all auth-related storage
    clearAuthStorage();
    
    // Clear React Query cache to ensure fresh data after login
    queryClient.clear();
    
    // Clear auth cookies (async, fire and forget)
    clearAuthCookies();
    
    console.log('[ClearSessionOnMount] Complete auth cleanup for fresh login');
  }, [queryClient]);

  useEffect(() => {
    // Log session errors for debugging but don't take action
    // OAuth flow handles these errors properly
    const sessionError = (session as { error?: string } | null)?.error;
    if (sessionError) {
      console.log('[ClearSessionOnMount] Session has error:', sessionError);
    }
  }, [session]);

  return null;
}

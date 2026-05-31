/**
 * PostHog Analytics Configuration
 * Provides analytics tracking for user behavior and product insights
 */

import posthog from 'posthog-js';

// PostHog configuration
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

// Initialize PostHog (call this once in app initialization)
export function initPostHog(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  if (!POSTHOG_KEY) {
    console.warn('[PostHog] API key not configured');
    return;
  }

  // Don't initialize in development unless analytics enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
    console.log('[PostHog] Analytics disabled in development');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: process.env.NODE_ENV === 'development',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });
  
  isInitialized = true;
}

// Identify a user (call after login/registration)
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  
  posthog.identify(userId, properties);
}

// Reset user identity (call on logout)
export function resetUser(): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  
  posthog.reset();
}

// Track a custom event
export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  
  posthog.capture(eventName, properties);
}

// Track page view (for SPA navigation)
export function trackPageView(url?: string): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  
  posthog.capture('$pageview', {
    $current_url: url || window.location.href,
  });
}

// Set user properties
export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  
  posthog.people.set(properties);
}

// Feature flags
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return false;
  
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

// Get feature flag value
export function getFeatureFlag<T = boolean | string>(flagKey: string): T | undefined {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return undefined;
  
  return posthog.getFeatureFlag(flagKey) as T | undefined;
}

// Export the posthog instance for advanced usage
export { posthog };


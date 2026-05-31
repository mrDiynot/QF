'use client';

/**
 * Application providers
 * Wraps the app with necessary context providers
 */

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider as SessionMonitor } from '@/components/providers/SessionProvider';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { SignalRProvider } from '@/contexts/SignalRContext';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { setUser as setSentryUser, clearUser as clearSentryUser } from '@/lib/sentry';
import { initPostHog, identifyUser, resetUser } from '@/lib/posthog';
import { triggerUnauthorized } from '@/lib/auth-events';
import { AxiosError } from 'axios';
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PrivacyConsentProvider } from '@/contexts/PrivacyConsentContext';

const PrivacyConsentBanner = dynamic(
  () => import('@/components/privacy/PrivacyConsentBanner').then(m => m.PrivacyConsentBanner),
  { ssr: false }
);

function SignalRWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  // Debug logs removed — session/token status is visible in React DevTools

  // Pass the token to SignalRProvider - the provider will handle when to connect
  // Only pass token after authentication is complete
  const tokenToPass = status === 'authenticated' ? accessToken : undefined;

  return (
    <SignalRProvider accessToken={tokenToPass}>
      {children}
    </SignalRProvider>
  );
}

function AnalyticsInitializer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Initialize analytics on mount
    if (typeof window !== 'undefined') {
      initPostHog();
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Identify user in analytics
      const userId = session.user.id || session.user.email || 'unknown';
      const userProps = {
        email: session.user.email,
        name: session.user.firstName && session.user.lastName 
          ? `${session.user.firstName} ${session.user.lastName}`
          : session.user.email,
        role: session.user.role,
      };

      setSentryUser({ id: userId, email: session.user.email, username: userProps.name });
      identifyUser(userId, userProps);
    } else if (status === 'unauthenticated') {
      // Clear user on logout
      clearSentryUser();
      resetUser();
    }
  }, [session, status]);

  return null;
}

/**
 * Check if an error is a 401 Unauthorized from the API
 */
function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  // Check for generic error with status
  const err = error as { response?: { status?: number } };
  return err?.response?.status === 401;
}

/**
 * Check if we're in an auth flow where 401s are expected
 */
function isInAuthFlow(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  return pathname.includes('/login') ||
         pathname.includes('/register') ||
         pathname.includes('/verify-email') ||
         pathname.includes('/oauth/callback') ||
         pathname.includes('/forgot-password') ||
         pathname.includes('/reset-password');
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Skip auth event cascade when devBypass is active — the axios interceptor
            // should have already swallowed 401/403, so reaching here means it's a real
            // auth failure that deserves a trigger only outside of dev bypass mode.
            const isDevBypass =
              typeof window !== 'undefined' &&
              sessionStorage.getItem('devBypass') === 'true';
            // Handle 401 errors globally for all queries
            if (isUnauthorizedError(error) && !isInAuthFlow() && !isDevBypass) {
              console.error('[QueryCache] Unauthorized error in query:', query.queryKey);
              // Trigger logout via auth events (axios interceptor may have already tried refresh)
              triggerUnauthorized('API request unauthorized');
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const isDevBypass =
              typeof window !== 'undefined' &&
              sessionStorage.getItem('devBypass') === 'true';
            // Handle 401 errors globally for all mutations
            if (isUnauthorizedError(error) && !isInAuthFlow() && !isDevBypass) {
              console.error('[MutationCache] Unauthorized error in mutation:', mutation.options.mutationKey);
              // Trigger logout via auth events
              triggerUnauthorized('API mutation unauthorized');
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry 401 errors - let the auth event system handle them
              if (isUnauthorizedError(error)) {
                return false;
              }
              // Retry other errors up to 2 times
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry 401 errors
              if (isUnauthorizedError(error)) {
                return false;
              }
              // Retry other errors once
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <NextAuthSessionProvider basePath="/api/auth" refetchInterval={5 * 60} refetchOnWindowFocus={true}>
        <QueryClientProvider client={queryClient}>
          {/* SessionMonitor must be inside QueryClientProvider because it uses useQueryClient */}
          <SessionMonitor>
            <PrivacyConsentProvider>
              <Suspense fallback={null}>
                <PostHogProvider>
                  <AnalyticsInitializer />
                  <CommandPalette />
                  <SignalRWrapper>
                    {children}
                  </SignalRWrapper>
                </PostHogProvider>
              </Suspense>
              <Toaster position="top-right" richColors closeButton />
              <PrivacyConsentBanner />
            </PrivacyConsentProvider>
          </SessionMonitor>
        </QueryClientProvider>
      </NextAuthSessionProvider>
    </ErrorBoundary>
  );
}
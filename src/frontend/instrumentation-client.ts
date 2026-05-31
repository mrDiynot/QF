/**
 * Next.js Client Instrumentation File
 *
 * This file is used to initialize Sentry for client-side (browser) runtime.
 * Content moved from sentry.client.config.ts for Turbopack compatibility.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
 */

import * as Sentry from '@sentry/nextjs';

// Initialize Sentry for client-side (browser) runtime
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rates based on environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay for debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Disable debug mode to avoid the non-debug bundle warning
  debug: false,

  // Environment tag
  environment: process.env.NODE_ENV || 'development',

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
      return null;
    }
    return event;
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

/**
 * Capture router transitions for performance monitoring
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#instrument-navigations
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;


/**
 * Next.js Instrumentation File
 *
 * This file is used to initialize Sentry and other monitoring tools
 * in Next.js 15+. It replaces the deprecated sentry.*.config.ts files.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Initialize Sentry for Node.js runtime (server-side)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Initialize Sentry for Edge runtime (middleware)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Capture errors from nested React Server Components
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
 */
export const onRequestError = Sentry.captureRequestError;


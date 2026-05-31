'use client';

/**
 * Global Error Handler
 * Catches unhandled errors and reports them to Sentry
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-600 mb-6">
              We apologize for the inconvenience. Our team has been notified and is working on a fix.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-slate-100 rounded-lg text-left">
                <p className="text-sm font-mono text-slate-700 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-slate-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


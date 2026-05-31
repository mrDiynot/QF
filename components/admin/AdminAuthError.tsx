'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, Clock } from 'lucide-react';
import { AdminApiError } from '@/services/api/admin.service';

interface AdminAuthErrorProps {
  error: unknown;
  fallbackMessage?: string;
}

/**
 * Displays structured backend error responses for admin auth pages.
 * Surfaces status codes, validation errors, and detailed messages from ProblemDetails.
 */
export function AdminAuthError({ error, fallbackMessage = 'An unexpected error occurred.' }: AdminAuthErrorProps) {
  if (!error) return null;

  // Structured AdminApiError from adminFetch
  if (error instanceof AdminApiError) {
    const hasValidationErrors = Object.keys(error.errors).length > 0;

    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">
          {error.title}{error.statusCode ? ` (${error.statusCode})` : ''}
        </AlertTitle>
        <AlertDescription className="mt-1 space-y-2">
          <p>{error.detail}</p>
          {hasValidationErrors && (
            <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
              {Object.entries(error.errors).map(([field, messages]) => (
                messages.map((msg, i) => (
                  <li key={`${field}-${i}`}>
                    <span className="font-medium">{field}:</span> {msg}
                  </li>
                ))
              ))}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Plain Error with message
  if (error instanceof Error) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Fallback for unknown error shapes
  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{fallbackMessage}</AlertDescription>
    </Alert>
  );
}

interface SessionReasonBannerProps {
  reason: string | null;
}

/**
 * Shows a session expiry / redirect reason banner on the login page.
 */
export function SessionReasonBanner({ reason }: SessionReasonBannerProps) {
  if (!reason) return null;

  const isTimeout = reason.toLowerCase().includes('inactivity') || reason.toLowerCase().includes('expired');

  return (
    <Alert className={isTimeout
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-blue-50 border-blue-200 text-blue-800'
    }>
      {isTimeout ? <Clock className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      <AlertDescription>{reason}</AlertDescription>
    </Alert>
  );
}


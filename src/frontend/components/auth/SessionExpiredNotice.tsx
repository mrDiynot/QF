'use client';

/**
 * Session Expired Notice
 * Shows a notice when user's session has expired
 */

import { AlertCircle } from 'lucide-react';

export function SessionExpiredNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-error bg-error-bg p-4">
      <AlertCircle className="h-5 w-5 shrink-0 text-error" />
      <p className="small-text text-error-dark">
        Your session has expired. Please sign in again to continue.
      </p>
    </div>
  );
}
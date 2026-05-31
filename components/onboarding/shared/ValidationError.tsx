'use client';

/**
 * Inline validation error component for onboarding forms
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationErrorProps {
  message: string | null;
  className?: string;
}

export function ValidationError({ message, className }: ValidationErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200',
        className
      )}
      role="alert"
    >
      <AlertCircle className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface ValidationSummaryProps {
  errors: { field: string; message: string }[];
  className?: string;
}

export function ValidationSummary({ errors, className }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-red-800">Please fix the following:</h4>
          <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error) => (
              <li key={error.field}>{error.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


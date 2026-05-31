'use client';

/**
 * useApiError Hook
 * 
 * Provides a consistent way to handle API errors across the application.
 * Shows user-friendly toast messages while logging technical details.
 * 
 * Usage:
 * ```tsx
 * const { handleError, showError } = useApiError();
 * 
 * try {
 *   await api.doSomething();
 * } catch (error) {
 *   handleError(error); // Shows user-friendly toast and logs technical details
 * }
 * 
 * // Or with custom context:
 * handleError(error, { context: 'Failed to save lead' });
 * ```
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { parseApiError, ApiError, ApiErrorCode } from '@/lib/api-error';
import { captureException } from '@/lib/sentry';

interface HandleErrorOptions {
  /** Custom context message for logging (e.g., "Failed to save lead") */
  context?: string;
  /** Override the user-friendly message */
  userMessage?: string;
  /** Show toast notification (default: true) */
  showToast?: boolean;
  /** Log to console (default: true in dev) */
  logToConsole?: boolean;
  /** Report to Sentry (default: true) */
  reportToSentry?: boolean;
  /** Callback when error is auth-related (401/403) */
  onAuthError?: () => void;
  /** Callback for validation errors with field details */
  onValidationError?: (details?: Record<string, unknown>) => void;
}

interface UseApiErrorReturn {
  /** Parse and handle an error - shows toast, logs, reports to Sentry */
  handleError: (error: unknown, options?: HandleErrorOptions) => ApiError;
  /** Just parse an error without showing toast */
  parseError: (error: unknown) => ApiError;
  /** Show a user-friendly error toast */
  showError: (message: string, title?: string) => void;
  /** Show a user-friendly warning toast */
  showWarning: (message: string, title?: string) => void;
  /** Get user-friendly message for an error */
  getUserMessage: (error: unknown) => string;
  /** Check if error is of specific type */
  isErrorType: (error: unknown, code: ApiErrorCode) => boolean;
}

/**
 * Hook for consistent API error handling across the application
 */
export function useApiError(): UseApiErrorReturn {
  /**
   * Parse an error without side effects
   */
  const parseError = useCallback((error: unknown): ApiError => {
    return parseApiError(error);
  }, []);

  /**
   * Get a user-friendly message from any error
   */
  const getUserMessage = useCallback((error: unknown): string => {
    const apiError = parseApiError(error);
    return apiError.userMessage;
  }, []);

  /**
   * Check if an error is of a specific type
   */
  const isErrorType = useCallback((error: unknown, code: ApiErrorCode): boolean => {
    const apiError = parseApiError(error);
    return apiError.code === code;
  }, []);

  /**
   * Show a user-friendly error toast
   */
  const showError = useCallback((message: string, title?: string) => {
    toast.error(title || 'Error', {
      description: message,
      duration: 5000,
    });
  }, []);

  /**
   * Show a user-friendly warning toast
   */
  const showWarning = useCallback((message: string, title?: string) => {
    toast.warning(title || 'Warning', {
      description: message,
      duration: 4000,
    });
  }, []);

  /**
   * Handle an error with full processing - toast, logging, Sentry
   */
  const handleError = useCallback((
    error: unknown,
    options: HandleErrorOptions = {}
  ): ApiError => {
    const {
      context,
      userMessage,
      showToast: shouldShowToast = true,
      logToConsole = process.env.NODE_ENV === 'development',
      reportToSentry = true,
      onAuthError,
      onValidationError,
    } = options;

    const apiError = parseApiError(error);
    const displayMessage = userMessage || apiError.userMessage;

    // Log technical details for debugging
    if (logToConsole) {
      const logContext = context ? `[${context}]` : '[API Error]';
      console.error(logContext, {
        code: apiError.code,
        statusCode: apiError.statusCode,
        message: apiError.message,
        userMessage: apiError.userMessage,
        details: apiError.details,
        retryable: apiError.retryable,
      });
    }

    // Report to Sentry with context
    if (reportToSentry && apiError.statusCode !== 401) {
      captureException(apiError.originalError || apiError, {
        context: context || 'API Error',
        errorCode: apiError.code,
        statusCode: apiError.statusCode,
        details: apiError.details,
      });
    }

    // Handle specific error types
    if (apiError.isAuthError() && onAuthError) {
      onAuthError();
    }

    if (apiError.code === 'VALIDATION_ERROR' && onValidationError) {
      onValidationError(apiError.details);
    }

    // Show user-friendly toast
    if (shouldShowToast) {
      const isServerError = apiError.isServerError() || apiError.code === 'NETWORK_ERROR';
      
      if (isServerError) {
        toast.error('Something went wrong', {
          description: displayMessage,
          duration: 6000,
        });
      } else if (apiError.code === 'VALIDATION_ERROR') {
        toast.warning('Please check your input', {
          description: displayMessage,
          duration: 5000,
        });
      } else {
        toast.error('Error', {
          description: displayMessage,
          duration: 5000,
        });
      }
    }

    return apiError;
  }, []);

  return {
    handleError,
    parseError,
    showError,
    showWarning,
    getUserMessage,
    isErrorType,
  };
}

export default useApiError;


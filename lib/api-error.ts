/**
 * Centralized API Error Handling
 * 
 * Enterprise-grade error handling for all API calls.
 * Provides typed errors, user-friendly messages, and error tracking.
 */

import { AxiosError } from 'axios';

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN';

export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  userMessage: string;
  statusCode?: number;
  field?: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryAfter?: number; // seconds
}

// ============================================================================
// API ERROR CLASS
// ============================================================================

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly userMessage: string;
  public readonly statusCode?: number;
  public readonly field?: string;
  public readonly details?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly originalError?: Error;

  constructor(details: ApiErrorDetails, originalError?: Error) {
    super(details.message);
    this.name = 'ApiError';
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.statusCode = details.statusCode;
    this.field = details.field;
    this.details = details.details;
    this.retryable = details.retryable;
    this.retryAfter = details.retryAfter;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if this error is of a specific type
   */
  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if this error is an authentication error
   */
  isAuthError(): boolean {
    return this.code === 'UNAUTHORIZED' || this.code === 'FORBIDDEN';
  }

  /**
   * Check if this error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode !== undefined && this.statusCode >= 500;
  }

  /**
   * Convert to a plain object for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      field: this.field,
      details: this.details,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
    };
  }
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES: Record<ApiErrorCode, { message: string; userMessage: string }> = {
  NETWORK_ERROR: {
    message: 'Network request failed',
    userMessage: 'Unable to connect. Please check your internet connection and try again.',
  },
  TIMEOUT: {
    message: 'Request timed out',
    userMessage: 'The request took too long. Please try again.',
  },
  UNAUTHORIZED: {
    message: 'Authentication required',
    userMessage: 'Please sign in to continue.',
  },
  FORBIDDEN: {
    message: 'Access denied',
    userMessage: 'You don\'t have permission to perform this action.',
  },
  NOT_FOUND: {
    message: 'Resource not found',
    userMessage: 'The requested item could not be found.',
  },
  VALIDATION_ERROR: {
    message: 'Validation failed',
    userMessage: 'Please check your input and try again.',
  },
  CONFLICT: {
    message: 'Resource conflict',
    userMessage: 'This action conflicts with existing data. Please refresh and try again.',
  },
  RATE_LIMITED: {
    message: 'Rate limit exceeded',
    userMessage: 'Too many requests. Please wait a moment and try again.',
  },
  SERVER_ERROR: {
    message: 'Server error',
    userMessage: 'Something went wrong on our end. Please try again later.',
  },
  SERVICE_UNAVAILABLE: {
    message: 'Service unavailable',
    userMessage: 'The service is temporarily unavailable. Please try again later.',
  },
  UNKNOWN: {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
  },
};

// ============================================================================
// ERROR PARSING
// ============================================================================

/**
 * Parse an error from any source into a standardized ApiError
 */
export function parseApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Axios error
  if (isAxiosError(error)) {
    return parseAxiosError(error);
  }

  // Standard Error
  if (error instanceof Error) {
    return new ApiError({
      code: 'UNKNOWN',
      message: error.message,
      userMessage: ERROR_MESSAGES.UNKNOWN.userMessage,
      retryable: true,
    }, error);
  }

  // Unknown error type
  return new ApiError({
    code: 'UNKNOWN',
    message: String(error),
    userMessage: ERROR_MESSAGES.UNKNOWN.userMessage,
    retryable: true,
  });
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}

/**
 * Parse an Axios error into an ApiError
 */
function parseAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const data = error.response?.data as Record<string, unknown> | undefined;

  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError({
        code: 'TIMEOUT',
        ...ERROR_MESSAGES.TIMEOUT,
        retryable: true,
      }, error);
    }
    return new ApiError({
      code: 'NETWORK_ERROR',
      ...ERROR_MESSAGES.NETWORK_ERROR,
      retryable: true,
    }, error);
  }

  // Parse server error message
  const serverMessage = extractServerMessage(data);

  // Map status codes to error types
  switch (status) {
    case 400:
      return new ApiError({
        code: 'VALIDATION_ERROR',
        message: serverMessage || ERROR_MESSAGES.VALIDATION_ERROR.message,
        userMessage: serverMessage || ERROR_MESSAGES.VALIDATION_ERROR.userMessage,
        statusCode: status,
        details: data?.errors as Record<string, unknown>,
        retryable: false,
      }, error);

    case 401:
      return new ApiError({
        code: 'UNAUTHORIZED',
        message: serverMessage || ERROR_MESSAGES.UNAUTHORIZED.message,
        userMessage: ERROR_MESSAGES.UNAUTHORIZED.userMessage,
        statusCode: status,
        retryable: false,
      }, error);

    case 403:
      return new ApiError({
        code: 'FORBIDDEN',
        message: serverMessage || ERROR_MESSAGES.FORBIDDEN.message,
        userMessage: ERROR_MESSAGES.FORBIDDEN.userMessage,
        statusCode: status,
        retryable: false,
      }, error);

    case 404:
      return new ApiError({
        code: 'NOT_FOUND',
        message: serverMessage || ERROR_MESSAGES.NOT_FOUND.message,
        userMessage: serverMessage || ERROR_MESSAGES.NOT_FOUND.userMessage,
        statusCode: status,
        retryable: false,
      }, error);

    case 409:
      return new ApiError({
        code: 'CONFLICT',
        message: serverMessage || ERROR_MESSAGES.CONFLICT.message,
        userMessage: serverMessage || ERROR_MESSAGES.CONFLICT.userMessage,
        statusCode: status,
        retryable: false,
      }, error);

    case 429:
      const retryAfter = parseInt(error.response?.headers?.['retry-after'] || '60', 10);
      return new ApiError({
        code: 'RATE_LIMITED',
        message: ERROR_MESSAGES.RATE_LIMITED.message,
        userMessage: `Too many requests. Please wait ${retryAfter} seconds and try again.`,
        statusCode: status,
        retryable: true,
        retryAfter,
      }, error);

    case 500:
    case 502:
    case 504:
      return new ApiError({
        code: 'SERVER_ERROR',
        message: serverMessage || ERROR_MESSAGES.SERVER_ERROR.message,
        userMessage: ERROR_MESSAGES.SERVER_ERROR.userMessage,
        statusCode: status,
        retryable: true,
      }, error);

    case 503:
      return new ApiError({
        code: 'SERVICE_UNAVAILABLE',
        message: serverMessage || ERROR_MESSAGES.SERVICE_UNAVAILABLE.message,
        userMessage: ERROR_MESSAGES.SERVICE_UNAVAILABLE.userMessage,
        statusCode: status,
        retryable: true,
        retryAfter: parseInt(error.response?.headers?.['retry-after'] || '30', 10),
      }, error);

    default:
      return new ApiError({
        code: status && status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN',
        message: serverMessage || ERROR_MESSAGES.UNKNOWN.message,
        userMessage: serverMessage || ERROR_MESSAGES.UNKNOWN.userMessage,
        statusCode: status,
        retryable: status ? status >= 500 : true,
      }, error);
  }
}

/**
 * Extract error message from server response
 */
function extractServerMessage(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;

  // Common error message fields
  const messageFields = ['message', 'error', 'detail', 'title', 'errorMessage'];
  
  for (const field of messageFields) {
    if (typeof data[field] === 'string') {
      return data[field] as string;
    }
  }

  // ASP.NET Core ProblemDetails format
  if (data.errors && typeof data.errors === 'object') {
    const errors = data.errors as Record<string, string[]>;
    const firstError = Object.values(errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }

  return undefined;
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Handle an API error with optional callbacks
 */
export function handleApiError(
  error: unknown,
  options?: {
    onUnauthorized?: () => void;
    onForbidden?: () => void;
    onNotFound?: () => void;
    onValidationError?: (details?: Record<string, unknown>) => void;
    onServerError?: () => void;
    onNetworkError?: () => void;
    showToast?: (message: string, type: 'error' | 'warning') => void;
  }
): ApiError {
  const apiError = parseApiError(error);

  // Call specific handlers
  switch (apiError.code) {
    case 'UNAUTHORIZED':
      options?.onUnauthorized?.();
      break;
    case 'FORBIDDEN':
      options?.onForbidden?.();
      break;
    case 'NOT_FOUND':
      options?.onNotFound?.();
      break;
    case 'VALIDATION_ERROR':
      options?.onValidationError?.(apiError.details);
      break;
    case 'SERVER_ERROR':
    case 'SERVICE_UNAVAILABLE':
      options?.onServerError?.();
      break;
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      options?.onNetworkError?.();
      break;
  }

  // Show toast notification if provided
  if (options?.showToast) {
    const type = apiError.isServerError() || apiError.code === 'NETWORK_ERROR' ? 'error' : 'warning';
    options.showToast(apiError.userMessage, type);
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', apiError.toJSON());
  }

  // Report to Sentry if available
  if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (error: Error) => void } }).Sentry) {
    (window as unknown as { Sentry: { captureException: (error: Error) => void } }).Sentry.captureException(apiError);
  }

  return apiError;
}

/**
 * Create a retry handler for React Query
 */
export function createRetryHandler(maxRetries: number = 3) {
  return (failureCount: number, error: unknown): boolean => {
    const apiError = parseApiError(error);
    
    // Don't retry if max retries reached
    if (failureCount >= maxRetries) return false;
    
    // Only retry if the error is retryable
    return apiError.retryable;
  };
}

/**
 * Create a retry delay function for React Query
 */
export function createRetryDelay(baseDelay: number = 1000) {
  return (attemptIndex: number, error: unknown): number => {
    const apiError = parseApiError(error);
    
    // Use server-provided retry-after if available
    if (apiError.retryAfter) {
      return apiError.retryAfter * 1000;
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(baseDelay * Math.pow(2, attemptIndex), 30000);
  };
}

const apiErrorUtils = {
  ApiError,
  parseApiError,
  handleApiError,
  createRetryHandler,
  createRetryDelay,
};

export default apiErrorUtils;

/**
 * Centralized Toast Utility for QualiFlow AI
 * 
 * Provides consistent, SaaS-grade toast notifications across the platform.
 * Features:
 * - Standardized success/error/warning/info patterns
 * - Automatic modal closing on non-recoverable errors
 * - Action buttons for contextual navigation
 * - Consistent durations and styling
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

// Standard durations for different toast types
const DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  action: 8000, // Longer for toasts with actions
} as const;

// Toast action type
interface ToastAction {
  label: string;
  onClick: () => void;
}

// Extended toast options
interface ToastOptions extends Omit<ExternalToast, 'action'> {
  action?: ToastAction;
}

/**
 * Success toast - for completed actions
 */
function success(message: string, options?: ToastOptions) {
  const { action, ...rest } = options || {};
  sonnerToast.success(message, {
    duration: action ? DURATIONS.action : DURATIONS.success,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    ...rest,
  });
}

/**
 * Error toast - for failed actions
 */
function error(message: string, options?: ToastOptions) {
  const { action, ...rest } = options || {};
  sonnerToast.error(message, {
    duration: action ? DURATIONS.action : DURATIONS.error,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    ...rest,
  });
}

/**
 * Warning toast - for non-critical issues or conflicts
 */
function warning(message: string, options?: ToastOptions) {
  const { action, ...rest } = options || {};
  sonnerToast.warning(message, {
    duration: action ? DURATIONS.action : DURATIONS.warning,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    ...rest,
  });
}

/**
 * Info toast - for informational messages
 */
function info(message: string, options?: ToastOptions) {
  const { action, ...rest } = options || {};
  sonnerToast.info(message, {
    duration: action ? DURATIONS.action : DURATIONS.info,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    ...rest,
  });
}

/**
 * Loading toast - returns promise for async operations
 */
function loading(message: string) {
  return sonnerToast.loading(message);
}

/**
 * Dismiss a specific toast or all toasts
 */
function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Promise toast - wraps async operations
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return sonnerToast.promise(promise, messages);
}

// ============================================
// Mutation Helper Types & Functions
// ============================================

export interface MutationToastConfig {
  successMessage: string;
  successDescription?: string;
  errorMessage?: string;
  // Modal/form state management
  closeModal?: () => void;
  resetForm?: () => void;
  // For invalidating queries
  onSuccess?: () => void;
  // Custom error handlers
  errorHandlers?: {
    // Pattern to match in error message
    pattern: string | RegExp;
    // Toast type to show
    type: 'error' | 'warning' | 'info';
    // Message to display
    message: string;
    description?: string;
    // Action button
    action?: ToastAction;
    // Should close modal on this error?
    closeModal?: boolean;
  }[];
}

/**
 * Creates consistent onSuccess handler for mutations
 */
export function createSuccessHandler(config: MutationToastConfig) {
  return () => {
    config.closeModal?.();
    config.resetForm?.();
    config.onSuccess?.();
    success(config.successMessage, {
      description: config.successDescription,
    });
  };
}

/**
 * Creates consistent onError handler for mutations
 * Automatically handles common error patterns and closes modals appropriately
 */
export function createErrorHandler(config: MutationToastConfig) {
  return (err: Error & { response?: { status?: number; data?: { message?: string; detail?: string; title?: string } } }) => {
    const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message || '';
    const status = err.response?.status;

    // Check custom error handlers first
    if (config.errorHandlers) {
      for (const handler of config.errorHandlers) {
        const matches = typeof handler.pattern === 'string'
          ? errorMessage.toLowerCase().includes(handler.pattern.toLowerCase())
          : handler.pattern.test(errorMessage);

        if (matches) {
          if (handler.closeModal !== false) {
            config.closeModal?.();
            config.resetForm?.();
          }

          const toastFn = handler.type === 'warning' ? warning : handler.type === 'info' ? info : error;
          toastFn(handler.message, {
            description: handler.description,
            action: handler.action,
          });
          return;
        }
      }
    }

    // Handle common HTTP status codes
    if (status === 402) {
      config.closeModal?.();
      error('Limit reached', {
        description: 'Please upgrade your plan to continue.',
      });
      return;
    }

    if (status === 403) {
      config.closeModal?.();
      config.resetForm?.();
      error('Access denied', {
        description: err.response?.data?.detail || 'You don\'t have permission for this action.',
      });
      return;
    }

    if (status === 404) {
      config.closeModal?.();
      error('Not found', {
        description: 'The requested resource no longer exists.',
      });
      return;
    }

    if (status === 409) {
      // Conflict - resource already exists
      config.closeModal?.();
      config.resetForm?.();
      warning('Conflict detected', {
        description: errorMessage || 'This resource already exists.',
      });
      return;
    }

    // Default error handling
    error(config.errorMessage || 'Action failed', {
      description: errorMessage || 'Please try again or contact support.',
    });
  };
}

// Export the toast object with all methods
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  dismiss,
  promise,
  // Re-export raw sonner toast for edge cases
  raw: sonnerToast,
};

export default toast;


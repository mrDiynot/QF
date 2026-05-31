'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiErrorFallbackProps {
  error?: Error | null;
  retry?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'page';
  message?: string;
}

/**
 * ApiErrorFallback component
 * Displays user-friendly error messages for API failures
 * Provides retry functionality and graceful degradation
 */
export function ApiErrorFallback({
  error,
  retry,
  className,
  variant = 'card',
  message,
}: ApiErrorFallbackProps) {
  const isNetworkError = error?.message.toLowerCase().includes('network') || 
                         error?.message.toLowerCase().includes('fetch');

  const defaultMessage = isNetworkError
    ? 'Unable to connect. Please check your internet connection.'
    : 'Unable to load this content right now.';

  const displayMessage = message || defaultMessage;

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200",
        className
      )}>
        <div className="flex items-center gap-2.5">
          {isNetworkError ? (
            <WifiOff className="size-4 text-red-600 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-red-600 shrink-0" />
          )}
          <span className="text-sm text-red-900 font-medium">{displayMessage}</span>
        </div>
        {retry && (
          <button
            onClick={retry}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-200",
        className
      )}>
        <div className="size-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          {isNetworkError ? (
            <WifiOff className="size-6 text-red-600" />
          ) : (
            <AlertCircle className="size-6 text-red-600" />
          )}
        </div>
        <h4 className="text-base font-semibold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Error' : 'Unable to Load Content'}
        </h4>
        <p className="text-sm text-gray-600 mb-4 max-w-sm">
          {displayMessage}
        </p>
        {retry && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Page variant
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
      className
    )}>
      <div className="size-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        {isNetworkError ? (
          <WifiOff className="size-10 text-red-600" />
        ) : (
          <AlertCircle className="size-10 text-red-600" />
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {isNetworkError ? 'Connection Lost' : 'Something Went Wrong'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {displayMessage}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {retry && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            <RefreshCw className="size-5" />
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * NetworkStatus component
 * Shows online/offline status
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium shadow-lg">
      <WifiOff className="size-4" />
      <span>No internet connection. Some features may be unavailable.</span>
    </div>
  );
}

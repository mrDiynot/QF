'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { GradientButton } from './gradient-button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="size-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">
            We&apos;re sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <GradientButton
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Refresh Page
          </GradientButton>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simpler error fallback for inline use
export function ErrorFallback({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-200">
      <AlertCircle className="size-8 text-red-600 mb-3" />
      <h4 className="text-sm font-semibold text-gray-900 mb-1">
        Unable to load content
      </h4>
      <p className="text-xs text-gray-600 mb-4">
        {error?.message || 'An error occurred while loading this content'}
      </p>
      {reset && (
        <button
          onClick={reset}
          className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <RefreshCw className="size-3" />
          Try again
        </button>
      )}
    </div>
  );
}

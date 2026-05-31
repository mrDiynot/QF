'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  darkMode?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * Simulator Error Boundary
 * 
 * Catches JavaScript errors in the simulator pages and displays
 * a themed fallback UI with recovery options.
 */
export class SimulatorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry with simulator context
    const eventId = Sentry.captureException(error, {
      tags: {
        simulator: 'true',
        error_boundary: 'simulator',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({ eventId });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Simulator Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { darkMode = true } = this.props;

      return (
        <div className={`min-h-[400px] flex items-center justify-center p-6 ${
          darkMode ? 'bg-slate-950' : 'bg-slate-50'
        }`}>
          <Card className={`max-w-lg w-full ${
            darkMode 
              ? 'border-red-500/30 bg-slate-900' 
              : 'border-red-200 bg-red-50/50'
          }`}>
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`h-8 w-8 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <CardTitle className={`text-xl ${
                darkMode ? 'text-red-400' : 'text-red-900'
              }`}>
                Simulator Error
              </CardTitle>
              <p className={`text-sm ${
                darkMode ? 'text-slate-400' : 'text-red-700'
              }`}>
                Something went wrong in the simulator. Your test data is safe.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className={`rounded-lg p-4 text-sm ${
                  darkMode ? 'bg-slate-800' : 'bg-red-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className={`h-4 w-4 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                    <span className={`font-semibold ${
                      darkMode ? 'text-red-400' : 'text-red-800'
                    }`}>
                      Error Details
                    </span>
                  </div>
                  <p className={`font-mono break-all ${
                    darkMode ? 'text-slate-300' : 'text-red-700'
                  }`}>
                    {this.state.error.message}
                  </p>
                  {this.state.eventId && (
                    <p className={`text-xs mt-2 ${
                      darkMode ? 'text-slate-500' : 'text-red-500'
                    }`}>
                      Event ID: {this.state.eventId}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className={`flex-1 ${
                    darkMode 
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                      : 'border-red-300 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className={`flex-1 ${
                    darkMode 
                      ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/simulator"
                  className={`inline-flex items-center justify-center text-sm ${
                    darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-primary hover:text-violet-800'
                  }`}
                >
                  <LayoutGrid className="mr-1 h-4 w-4" />
                  Simulator Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center justify-center text-sm ${
                    darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Home className="mr-1 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SimulatorErrorBoundary;


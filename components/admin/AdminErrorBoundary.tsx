'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry with admin context
    const eventId = Sentry.captureException(error, {
      tags: {
        admin_portal: 'true',
        error_boundary: 'admin',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({ eventId });

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: '#0F172A' }}
          data-admin-theme="dark"
        >
          <Card className="w-full max-w-lg bg-[#1E293B] border-[#334155]">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-xl text-gray-900">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-admin-muted-foreground text-center">
                An unexpected error occurred in the admin portal. Our team has been notified.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] overflow-auto">
                  <p className="text-sm font-mono text-red-400">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {this.state.eventId && (
                <p className="text-xs text-admin-muted-foreground/60 text-center">
                  Error ID: {this.state.eventId}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/admin" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-[#334155] text-gray-900 hover:bg-[#334155]"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
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


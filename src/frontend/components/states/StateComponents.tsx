'use client';

/**
 * Error & Loading State Components
 * Error boundaries, loading indicators, and connection states
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Wifi,
  ServerCrash,
  Lock,
  Clock,
  Home,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Error Page Component
interface ErrorPageProps {
  title?: string;
  message?: string;
  code?: number | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  details?: string;
  className?: string;
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  code,
  onRetry,
  onGoBack,
  onGoHome,
  showDetails = false,
  details,
  className,
}: ErrorPageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] p-8 text-center", className)}>
      <div className="size-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <AlertTriangle className="size-8 text-error" />
      </div>
      {code && (
        <span className="text-sm font-mono text-muted-foreground/60 mb-2">Error {code}</span>
      )}
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        )}
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack} className="gap-2">
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome} className="gap-2">
            <Home className="size-4" />
            Go Home
          </Button>
        )}
      </div>

      {showDetails && details && (
        <details className="mt-6 text-left max-w-lg w-full">
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground/80">
            Technical details
          </summary>
          <pre className="mt-2 p-4 bg-muted/40 rounded-lg text-xs overflow-auto">
            {details}
          </pre>
        </details>
      )}
    </div>
  );
}

// Pre-built Error Pages
export function NotFoundPage({ onGoBack, onGoHome }: { onGoBack?: () => void; onGoHome?: () => void }) {
  return (
    <ErrorPage
      code={404}
      title="Page not found"
      message="The page you&apos;re looking for doesn&apos;t exist or has been moved."
      onGoBack={onGoBack}
      onGoHome={onGoHome}
    />
  );
}

export function UnauthorizedPage({ onGoHome }: { onGoBack?: () => void; onGoHome?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="size-16 rounded-full bg-warning/10 flex items-center justify-center mb-6">
        <Lock className="size-8 text-warning" />
      </div>
      <span className="text-sm font-mono text-muted-foreground/60 mb-2">Error 401</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Unauthorized</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        You don&apos;t have permission to access this page. Please sign in or contact support.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <a href="/auth/login">Sign In</a>
        </Button>
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>Go Home</Button>
        )}
      </div>
    </div>
  );
}

export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="size-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <ServerCrash className="size-8 text-error" />
      </div>
      <span className="text-sm font-mono text-muted-foreground/60 mb-2">Error 500</span>
      <h1 className="text-2xl font-bold text-foreground mb-2">Server Error</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Our servers are having trouble. We&apos;re working on it. Please try again later.
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Clock className="size-8 text-info" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Under Maintenance</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        We&apos;re performing scheduled maintenance. We&apos;ll be back shortly.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Check Status
      </Button>
    </div>
  );
}

// Loading States
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'size-4', md: 'size-8', lg: 'size-12' };
  return (
    <Loader2 className={cn("animate-spin text-primary", sizes[size], className)} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50",
      className
    )}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground mt-4">{message}</p>
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ message = 'Loading...', className }: LoadingPageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px]", className)}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground mt-4">{message}</p>
    </div>
  );
}

// Loading Button State
interface LoadingButtonProps {
  loading?: boolean;
  success?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({
  loading,
  success,
  children,
  loadingText = 'Loading...',
  successText = 'Success!',
  onClick,
  className,
  disabled,
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "gap-2",
        success && "bg-green-600 hover:bg-green-600",
        className
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {success && <CheckCircle className="size-4" />}
      {loading ? loadingText : success ? successText : children}
    </Button>
  );
}

// Connection Status
interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [online, setOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-all",
      online ? "bg-green-500 text-white" : "bg-red-500 text-white",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        {online ? (
          <>
            <Wifi className="size-4" />
            You&apos;re back online
          </>
        ) : (
          <>
            <WifiOff className="size-4" />
            You&apos;re offline. Some features may not work.
          </>
        )}
      </div>
    </div>
  );
}

// Offline Indicator (inline)
export function OfflineIndicator({ className }: { className?: string }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm",
      className
    )}>
      <WifiOff className="size-4" />
      Offline
    </div>
  );
}

// Retry Card
interface RetryCardProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

export function RetryCard({
  title = 'Failed to load',
  message = 'Something went wrong while loading this content.',
  onRetry,
  retrying = false,
  className,
}: RetryCardProps) {
  return (
    <Card className={cn("p-6 text-center", className)}>
      <AlertTriangle className="size-10 mx-auto text-amber-500 mb-4" />
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{message}</p>
      <Button onClick={onRetry} disabled={retrying} className="gap-2">
        {retrying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {retrying ? 'Retrying...' : 'Try Again'}
      </Button>
    </Card>
  );
}

// Progress with Status
interface ProgressWithStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress?: number;
  message?: string;
  className?: string;
}

export function ProgressWithStatus({ status, progress = 0, message, className }: ProgressWithStatusProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{message}</span>
        {status === 'loading' && <span className="text-primary">{progress}%</span>}
        {status === 'success' && <CheckCircle className="size-4 text-green-500" />}
        {status === 'error' && <AlertTriangle className="size-4 text-red-500" />}
      </div>
      <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            status === 'loading' && "bg-primary/50",
            status === 'success' && "bg-green-500",
            status === 'error' && "bg-red-500"
          )}
          style={{ width: status === 'success' ? '100%' : `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Empty Data State
interface EmptyDataProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyData({ icon, title, message, action, className }: EmptyDataProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && (
        <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center mb-4 text-muted-foreground/60">
          {icon}
        </div>
      )}
      <h3 className="font-medium text-foreground">{title}</h3>
      {message && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4 bg-primary hover:bg-purple-700">
          {action.label}
        </Button>
      )}
    </div>
  );
}

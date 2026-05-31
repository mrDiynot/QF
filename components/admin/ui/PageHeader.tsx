'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  isError?: boolean;
  errorMessage?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  isError,
  errorMessage = 'API Error - Using cached data',
  onRefresh,
  isRefreshing,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-admin-foreground">{title}</h1>
        {description && (
          <p className="text-admin-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isError && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">{errorMessage}</span>
          </div>
        )}
        {actions}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

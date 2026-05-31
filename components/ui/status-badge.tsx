import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        active: 'bg-success-bg text-success-dark',
        draft: 'bg-muted text-muted-foreground',
        connected: 'bg-success-bg text-success-dark',
        disconnected: 'bg-error-bg text-error-dark',
        popular: 'bg-warning-bg text-warning-dark',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showDot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, showDot = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ status, className }))}
        {...props}
      >
        {showDot && (
          <span className="size-1.5 rounded-full bg-current" />
        )}
        {children}
      </div>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: AdminEmptyStateProps) {
  const sizeClasses = {
    sm: { wrapper: 'py-8', icon: 'h-10 w-10', title: 'text-sm', desc: 'text-xs' },
    md: { wrapper: 'py-12', icon: 'h-14 w-14', title: 'text-base', desc: 'text-sm' },
    lg: { wrapper: 'py-16', icon: 'h-20 w-20', title: 'text-lg', desc: 'text-sm' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('text-center', sizes.wrapper, className)}>
      {Icon && (
        <div className="mx-auto mb-4 flex items-center justify-center">
          <div className="rounded-full bg-admin-muted p-4">
            <Icon className={cn(sizes.icon, 'text-admin-muted-foreground')} />
          </div>
        </div>
      )}
      <h3 className={cn('font-semibold text-admin-foreground', sizes.title)}>{title}</h3>
      <p className={cn('text-admin-muted-foreground mt-2 max-w-sm mx-auto', sizes.desc)}>
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-admin-primary text-admin-primary-foreground hover:bg-admin-primary/90"
              asChild={!!action.href}
            >
              {action.href ? (
                <a href={action.href} className="flex items-center gap-2">
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </a>
              ) : (
                <span className="flex items-center gap-2">
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </span>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

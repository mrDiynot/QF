import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 shadow-glow-sm">
        <Icon className="size-10 text-brand-purple" />
      </div>
      <h3 className="heading-3 text-text-navy mb-3">{title}</h3>
      <p className="body-text text-text-secondary mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="shadow-glow-sm hover:shadow-glow-purple transition-shadow">
          {action.label}
        </Button>
      )}
    </div>
  );
}
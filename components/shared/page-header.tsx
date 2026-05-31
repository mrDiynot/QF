import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-10 animate-fade-in', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <h1 className="text-[56px] font-bold leading-[61.6px] tracking-[-1.12px] text-foreground">{title}</h1>
          {description && (
            <p className="body-large text-text-secondary max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
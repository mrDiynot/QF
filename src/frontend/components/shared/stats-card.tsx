import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  icon: Icon,
  value,
  label,
  iconColor = 'text-white',
  iconBgColor = 'bg-brand-purple',
  className,
  ...props
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white p-6 shadow-elevation-sm transition-all hover:shadow-elevation-md',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className={cn('rounded-xl p-3', iconBgColor)}>
          <Icon className={cn('size-5', iconColor)} />
        </div>
        <div className="flex-1">
          <div className="text-4xl font-normal leading-10 text-foreground">
            {value}
          </div>
          <div className="text-sm text-text-secondary">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
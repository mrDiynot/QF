import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  label: string;
  icon?: ReactNode;
  className?: string;
  valueColor?: string;
}

export function StatsCard({
  value,
  label,
  icon,
  className,
  valueColor = 'text-text-navy',
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-2 rounded-2xl border border-border/50 bg-white p-6 shadow-elevation-sm hover:shadow-elevation-md transition-all cursor-pointer hover:-translate-y-1',
        className
      )}
    >
      {icon && <div className="mb-2 transition-transform group-hover:scale-110">{icon}</div>}
      <p className={cn('text-4xl font-bold leading-tight', valueColor)}>{value}</p>
      <p className="small-text text-text-secondary font-medium">{label}</p>
    </div>
  );
}
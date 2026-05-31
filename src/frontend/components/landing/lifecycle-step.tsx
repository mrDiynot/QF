import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LifecycleStepProps {
  icon: LucideIcon;
  title: string;
  color: string;
}

export function LifecycleStep({ icon: Icon, title, color }: LifecycleStepProps) {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className={cn('flex size-16 items-center justify-center rounded-2xl shadow-md text-white group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300', color)}>
        <Icon className="size-8" />
      </div>
      <span className="text-center small-text font-medium text-text-navy">{title}</span>
    </div>
  );
}
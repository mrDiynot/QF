import { ReactNode } from 'react';
import { Settings } from 'lucide-react';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';

interface ChannelCardProps {
  icon: ReactNode;
  name: string;
  description: string;
  count: number;
  isActive?: boolean;
  className?: string;
}

export function ChannelCard({
  icon,
  name,
  description,
  count,
  isActive = true,
  className,
}: ChannelCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-5 rounded-2xl border border-border/50 bg-white p-6 shadow-elevation-sm hover:shadow-elevation-lg transition-all cursor-pointer hover:-translate-y-1',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {isActive && <StatusBadge label="Active" variant="active" />}
      </div>

      <div>
        <h3 className="heading-3 text-text-navy mb-2">{name}</h3>
        <p className="small-text text-text-secondary leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div>
          <p className="text-3xl font-bold text-text-navy">{count}</p>
          <p className="tiny-text text-text-muted font-medium mt-1">leads captured</p>
        </div>
        <button className="rounded-xl p-2.5 hover:bg-bg-surface transition-all group-hover:bg-bg-surface">
          <Settings className="size-5 text-text-secondary group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}
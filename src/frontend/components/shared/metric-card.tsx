import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: number;
  showTrend?: boolean;
  className?: string;
}

export function MetricCard({ icon, value, label, change, showTrend = true, className }: MetricCardProps) {
  return (
    <Card className={cn('gap-4 p-6 hover:-translate-y-1 cursor-pointer group transition-all', className)}>
      <div className="flex items-start justify-between">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {showTrend && change !== undefined && (
          <div className="flex items-center gap-1.5 rounded-lg bg-success-bg px-3 py-1.5 shadow-sm">
            <TrendingUp className="size-3.5 text-success" />
            <span className="tiny-text font-medium text-success">
              +{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-4xl font-bold leading-tight text-text-navy">
          {value.toLocaleString()}
        </div>
        <div className="small-text text-text-secondary font-medium">{label}</div>
      </div>
    </Card>
  );
}
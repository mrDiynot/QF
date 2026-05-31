import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  label: string;
  variant?: 'active' | 'sent' | 'draft' | 'accepted' | 'pending' | 'ai-generated';
  className?: string;
}

export function StatusBadge({ label, variant = 'active', className }: StatusBadgeProps) {
  const variants = {
    active: 'bg-[#DCFCE7] text-[#008236]',
    sent: 'bg-[#DBEAFE] text-[#1447E6]',
    draft: 'bg-[#F3F4F6] text-[#364153]',
    accepted: 'bg-[#DCFCE7] text-[#008236]',
    pending: 'bg-[#FFEDD4] text-[#CA3500]',
    'ai-generated': 'bg-[#E0E7FF] text-[#432DD7]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1',
        variants[variant],
        className
      )}
    >
      {variant === 'active' && <CheckCircle className="size-3" />}
      <span className="tiny-text font-normal">{label}</span>
    </div>
  );
}
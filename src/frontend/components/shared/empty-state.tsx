import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in', className)}>
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-border/50 shadow-lg">
        <Icon className="size-10 text-brand-purple" />
      </div>
      <h3 className="heading-2 text-text-navy mb-3">{title}</h3>
      <p className="body-text text-text-secondary max-w-md leading-relaxed mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="lg" variant="gradient">
          {action.label}
        </Button>
      )}
    </div>
  );
}
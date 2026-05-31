import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function JourneyCard({ icon: Icon, title, description, color }: JourneyCardProps) {
  return (
    <Card className="group p-6 border-border/50 bg-white/80 backdrop-blur-sm hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300">
      <div className={cn('mb-4 flex size-12 items-center justify-center rounded-xl text-white shadow-md group-hover:scale-110 transition-transform', color)}>
        <Icon className="size-6" />
      </div>
      <h3 className="heading-4 mb-2 text-text-navy">{title}</h3>
      <p className="small-text text-text-secondary leading-relaxed">{description}</p>
      <div className={cn('mt-4 h-1 w-full rounded-full', color)}></div>
    </Card>
  );
}
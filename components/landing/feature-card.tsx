import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
}

export function FeatureCard({ icon: Icon, title, description, iconColor = 'text-brand-purple' }: FeatureCardProps) {
  return (
    <Card className="group p-6 hover:shadow-glow-sm hover:-translate-y-1 transition-all duration-300 border-border/50 bg-white/80 backdrop-blur-sm">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 group-hover:shadow-glow-sm transition-shadow">
        <Icon className={`size-6 ${iconColor}`} />
      </div>
      <h3 className="heading-3 mb-2 text-text-navy">{title}</h3>
      <p className="body-text text-text-secondary">{description}</p>
    </Card>
  );
}
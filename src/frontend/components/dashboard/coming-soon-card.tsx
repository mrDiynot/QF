import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface ComingSoonCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  estimatedDate?: string;
  className?: string;
}

export function ComingSoonCard({
  icon,
  title,
  description,
  badge = 'Coming Soon',
  estimatedDate,
  className = '',
}: ComingSoonCardProps) {
  return (
    <Card className={`relative overflow-hidden p-6 opacity-75 hover:opacity-90 transition-opacity ${className}`}>
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-xs bg-upgrade-purple-bg text-upgrade-purple border-upgrade-purple/20">
          {badge}
        </Badge>
      </div>
      
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-navy mb-1">
            {title}
          </h3>
          <p className="text-xs text-text-muted">
            {description}
          </p>
          {estimatedDate && (
            <p className="text-xs text-upgrade-purple mt-2 font-medium">
              Expected: {estimatedDate}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface ComingSoonSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function ComingSoonSection({
  icon,
  title,
  description,
  actionText,
  actionHref,
}: ComingSoonSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-gray-100 border-2 border-gray-200">
        {icon}
      </div>
      <Badge 
        variant="secondary" 
        className="mb-4 bg-white text-gray-700 border-gray-200 px-4 py-2"
      >
        <Sparkles className="size-4 mr-2" />
        Coming Soon
      </Badge>
      <h3 className="heading-3 text-text-navy mb-3">
        {title}
      </h3>
      <p className="body-text text-text-secondary max-w-md mb-6">
        {description}
      </p>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="text-sm font-medium text-brand-purple hover:text-brand-purple-dark transition-colors"
        >
          {actionText} →
        </a>
      )}
    </div>
  );
}
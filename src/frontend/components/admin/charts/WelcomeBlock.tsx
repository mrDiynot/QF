'use client';

import { cn } from '@/lib/utils';

interface WelcomeBlockProps {
  title: string;
  subtitle?: string;
  badge?: string;
  gradient?: 'teal' | 'purple' | 'orange' | 'blue';
  className?: string;
}

const gradients = {
  teal: 'bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400',
  purple: 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500',
  orange: 'bg-gradient-to-r from-[#FF6900] via-orange-400 to-amber-400',
  blue: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',
};

export function WelcomeBlock({
  title,
  subtitle,
  badge,
  gradient = 'teal',
  className,
}: WelcomeBlockProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6 min-h-[140px]',
        gradients[gradient],
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -right-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />
      
      {/* Content */}
      <div className="relative z-10 max-w-[200px]">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {subtitle && (
          <p className="text-sm text-white/80">{subtitle}</p>
        )}
      </div>

      {/* Badge */}
      {badge && (
        <div className="absolute top-1/2 -translate-y-1/2 right-6 z-10">
          <div className="h-14 w-14 bg-white dark:bg-indigo-950 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs font-semibold text-indigo-700 dark:text-white">{badge}</span>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface WelcomeBlockProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WelcomeBlock({
  title,
  subtitle,
  badge,
  className,
  children,
}: WelcomeBlockProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md p-4 h-full min-h-[120px]',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #FF6900 0%, #f97316 40%, #4F39F6 100%)',
      }}
    >
      {/* Decorative wave/circle elements */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute top-4 right-16 w-20 h-20 bg-white/8 rounded-full" />
      <div className="absolute -bottom-6 right-8 w-24 h-24 bg-orange-400/15 rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-[200px]">
        <h3 className="text-lg font-semibold text-white mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-white/90">
            {subtitle}
          </p>
        )}
        {children}
      </div>

      {/* Badge - styled like Dashcode's "now" badge */}
      {badge && (
        <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-medium text-white">
            {badge}
          </div>
        </div>
      )}
    </div>
  );
}

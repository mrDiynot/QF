import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card-light rounded-2xl p-6',
        hover && 'hover-lift',
        glow && 'shadow-glow-sm hover:shadow-glow-purple transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends React.ComponentProps<typeof Button> {
  glowColor?: 'purple' | 'blue' | 'green' | 'orange';
}

export function GlowButton({ 
  children, 
  className, 
  glowColor = 'purple',
  ...props 
}: GlowButtonProps) {
  const glowClasses = {
    purple: 'before:bg-gradient-to-r before:from-purple-600 before:to-blue-500',
    blue: 'before:bg-gradient-to-r before:from-blue-600 before:to-cyan-500',
    green: 'before:bg-gradient-to-r before:from-green-600 before:to-emerald-500',
    orange: 'before:bg-gradient-to-r before:from-orange-600 before:to-pink-500',
  };

  return (
    <div className="relative inline-block">
      <div className={cn(
        'absolute -inset-1 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300',
        glowClasses[glowColor]
      )} />
      <Button
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
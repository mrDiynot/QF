'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UnifiedHeaderProps {
  onMenuClick: () => void;
  title?: string;
  actions?: React.ReactNode;
  variant?: 'business' | 'admin' | 'simulator';
  className?: string;
}

export function UnifiedHeader({
  onMenuClick,
  title,
  actions,
  variant = 'business',
  className,
}: UnifiedHeaderProps) {
  const variantStyles = {
    business: 'bg-white border-border text-foreground',
    admin: 'bg-[hsl(215_27.9%_16.9%)] border-white/10 text-white',
    simulator: 'bg-emerald-900 border-emerald-700/30 text-white',
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-6',
      variantStyles[variant],
      className
    )}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="size-5" />
      </Button>

      {/* Page Title */}
      {title && (
        <h1 className="text-xl font-semibold">
          {title}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}

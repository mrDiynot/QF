'use client';

/**
 * Onboarding Header
 * Modern header with logo, AI badge, and skip button
 */

import { Logo } from '@/components/shared/logo';
import { AIBadge } from './AIBadge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingHeaderProps {
  onSkip?: () => void;
  showSkip?: boolean;
  className?: string;
}

export function OnboardingHeader({
  onSkip,
  showSkip = true,
  className,
}: OnboardingHeaderProps) {
  return (
    <header className={cn('w-full py-6 px-8', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with AI Badge */}
        <div className="flex items-center gap-3">
          <Logo className="h-8" />
          <AIBadge variant="pulse" />
        </div>

        {/* Skip button */}
        {showSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Setup
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

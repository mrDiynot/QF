'use client';

/**
 * Onboarding Step Card
 * BentoCard variant with step number, status badge, and conditional styling
 */

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoCard } from '@/components/dashboard/BentoGrid';
import { Badge } from '@/components/ui/badge';

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

interface OnboardingStepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  children: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3;
  className?: string;
  id?: string;
}

export function OnboardingStepCard({
  stepNumber,
  title,
  description,
  status,
  children,
  colSpan = 4,
  rowSpan = 1,
  className,
  id,
}: OnboardingStepCardProps) {
  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white border-success';
      case 'in_progress':
        return 'bg-brand-purple text-white border-brand-purple';
      default:
        return '';
    }
  };

  return (
    <div id={id}>
      <BentoCard
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={cn(
          'transition-all duration-300',
          status === 'completed' && 'opacity-90 border-success/30',
          status === 'in_progress' && 'border-brand-purple/50 shadow-lg ring-2 ring-brand-purple/20',
          status === 'not_started' && 'opacity-75',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Step Number Badge */}
            <div
              className={cn(
                'size-12 rounded-full flex items-center justify-center font-bold text-base shrink-0',
                status === 'completed'
                  ? 'bg-success text-white'
                  : status === 'in_progress'
                  ? 'bg-brand-purple text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {status === 'completed' ? <Check className="size-6" /> : stepNumber}
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
              <p className="text-base text-gray-500 mt-1">{description}</p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            variant={getStatusBadgeVariant()}
            className={cn('text-sm px-3 py-1 shrink-0', getStatusBadgeColor())}
          >
            {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </Badge>
        </div>

        {/* Step Content */}
        <div
          className={cn(
            'transition-opacity duration-200',
            status === 'not_started' && 'opacity-70 pointer-events-none'
          )}
        >
          {children}
        </div>
      </BentoCard>
    </div>
  );
}

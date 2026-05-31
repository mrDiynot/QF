'use client';

/**
 * Progress Breadcrumb Component
 * Desktop: Horizontal breadcrumb with arrows and step labels
 * Mobile: Compact dots with current step text
 * Responsive breakpoints: Mobile (<640px), Tablet (640-1023px), Desktop (≥1024px)
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Step {
  label: string;
  description?: string;
}

interface ProgressBreadcrumbProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  className?: string;
}

export function ProgressBreadcrumb({ steps, currentStep, className }: ProgressBreadcrumbProps) {
  const progressPercentage = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop/Tablet: Horizontal Breadcrumb */}
      <nav
        className="hidden sm:block"
        role="navigation"
        aria-label="Onboarding progress"
      >
        <ol className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <li key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  {/* Step Circle */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isComplete ? '#f97316' : isCurrent ? '#f97316' : '#e5e7eb',
                    }}
                    className={cn(
                      'flex size-8 md:size-10 items-center justify-center rounded-full transition-all duration-300',
                      isComplete && 'bg-brand-purple text-white',
                      isCurrent && 'bg-brand-purple text-white ring-4 ring-brand-purple/20',
                      !isComplete && !isCurrent && 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                      >
                        <Check className="size-4 md:size-5" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <span className="text-sm md:text-base font-semibold">{stepNumber}</span>
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium text-center whitespace-nowrap',
                      isComplete && 'text-muted-foreground',
                      isCurrent && 'text-gray-900 font-semibold',
                      !isComplete && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-2 md:mx-4 h-0.5 bg-gray-200 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-brand-purple"
                      initial={{ width: '0%' }}
                      animate={{ width: isComplete ? '100%' : '0%' }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile: Compact Progress Dots */}
      <div className="sm:hidden">
        <div className="flex flex-col items-center gap-3">
          {/* Current Step Text */}
          <p className="text-sm font-medium text-gray-900">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.label}
          </p>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            {steps.map((_, index) => {
              const stepNumber = index + 1;
              const isComplete = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <motion.div
                  key={index}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    isCurrent ? 'size-3 bg-brand-purple' : 'size-2',
                    isComplete && 'bg-brand-purple',
                    !isComplete && !isCurrent && 'bg-gray-300'
                  )}
                  animate={{ scale: isCurrent ? 1.2 : 1 }}
                />
              );
            })}
          </div>

          {/* Progress Percentage */}
          <p className="text-xs text-muted-foreground">
            {progressPercentage}% complete
          </p>
        </div>
      </div>
    </div>
  );
}


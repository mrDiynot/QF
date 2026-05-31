'use client';

/**
 * Enhanced Progress Indicator
 * Simplified 4-step progress instead of 10 individual steps
 * Shows current phase with smooth animations
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PhaseStep {
  id: number;
  label: string;
  description: string;
  steps: number[]; // Which steps belong to this phase
}

const PHASES: PhaseStep[] = [
  {
    id: 1,
    label: 'Business Profile',
    description: 'Tell us about your business',
    steps: [1, 2, 5, 6, 7], // Industry, Goals, Lead Type, CRM, Team Size
  },
  {
    id: 2,
    label: 'Lead Sources',
    description: 'Configure your channels',
    steps: [3, 4], // Lead Sources, Channels
  },
  {
    id: 3,
    label: 'AI Configuration',
    description: 'Set up automation',
    steps: [8, 9, 10], // Phone, Hours, Calendar
  },
  {
    id: 4,
    label: 'Complete',
    description: 'Ready to launch',
    steps: [11], // Onboarding Support (optional)
  },
];

interface EnhancedProgressIndicatorProps {
  currentStep: number;
  className?: string;
}

export function EnhancedProgressIndicator({
  currentStep,
  className,
}: EnhancedProgressIndicatorProps) {
  // Determine current phase based on step
  const currentPhase = PHASES.find(phase => 
    phase.steps.includes(currentStep)
  )?.id || 1;

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      {/* Phase indicators */}
      <div className="flex items-center justify-between mb-4">
        {PHASES.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isCompleted = phase.id < currentPhase;

          return (
            <div
              key={phase.id}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Phase circle */}
              <div className="relative flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'relative size-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                    isCompleted &&
                      'bg-gradient-to-br from-(--ai-primary) to-(--ai-accent) text-white shadow-ai',
                    isActive &&
                      'bg-gradient-to-br from-(--ai-primary) to-(--ai-accent) text-white shadow-ai-lg ring-4 ring-(--ai-primary)/20',
                    !isCompleted && !isActive &&
                      'bg-muted text-muted-foreground border-2 border-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5" strokeWidth={3} />
                  ) : (
                    <span>{phase.id}</span>
                  )}
                </motion.div>

                {/* Phase label - only show for active */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
                  >
                    <p className="text-sm font-semibold text-(--ai-primary)">
                      {phase.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {phase.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Connecting line */}
              {index < PHASES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-border" />
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-(--ai-primary) to-(--ai-accent)"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="mt-16">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {currentStep} of 10</span>
          <span>{Math.round((currentStep / 10) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 10) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-(--ai-primary) to-(--ai-accent) rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

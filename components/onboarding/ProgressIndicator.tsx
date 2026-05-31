'use client';

/**
 * Progress indicator for onboarding wizard
 * Vibrant design matching landing page aesthetic
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'dark' | 'light';
}

// Map 11 steps to 4 phases for visual progress indicator
// Phase 1: Business Profile = Steps 1-3 (Business Type, Goals, Lead Sources)
// Phase 2: Channels = Steps 4-7 (Channels, Lead Type, CRM, Team Size)
// Phase 3: AI Setup = Steps 8-10 (Phone Setup, Business Hours, Calendar)
// Phase 4: Complete = Step 11 (Onboarding Support)
const phases = [
  { id: 1, title: 'Business Profile', steps: [1, 2, 3] },
  { id: 2, title: 'Channels', steps: [4, 5, 6, 7] },
  { id: 3, title: 'AI Setup', steps: [8, 9, 10] },
  { id: 4, title: 'Complete', steps: [11] },
];

function getPhaseForStep(step: number): number {
  for (const phase of phases) {
    if (phase.steps.includes(step)) return phase.id;
  }
  return 1;
}

export function ProgressIndicator({ currentStep, totalSteps, variant = 'dark' }: ProgressIndicatorProps) {
  const currentPhase = getPhaseForStep(currentStep);
  const isLight = variant === 'light';

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        {phases.map((phase, index) => {
          const isCompleted = currentPhase > phase.id;
          const isCurrent = currentPhase === phase.id;

          return (
            <div key={phase.id} className="flex items-center">
              {/* Phase Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isCurrent
                        ? 'bg-gradient-brand text-white shadow-lg shadow-brand ring-4 ring-primary/30'
                        : isLight
                          ? 'bg-muted text-muted-foreground border border-border'
                          : 'bg-white/20 text-white/60 border border-white/30'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    phase.id
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium whitespace-nowrap transition-colors',
                    isCompleted
                      ? isLight ? 'text-emerald-600' : 'text-emerald-300'
                      : isCurrent
                        ? isLight ? 'text-foreground' : 'text-white'
                        : isLight ? 'text-muted-foreground/60' : 'text-white/50'
                  )}
                >
                  {phase.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-1 mx-3 rounded-full transition-all duration-300',
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : isLight ? 'bg-muted' : 'bg-white/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step counter below */}
      <div className="mt-4 text-center">
        <span className={cn('text-xs', isLight ? 'text-muted-foreground' : 'text-white/70')}>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
}
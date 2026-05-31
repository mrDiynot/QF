'use client';

/**
 * Enhanced Onboarding Layout
 * Modern layout with AI gradient background
 * Competitive design inspired by Linear, Stripe, Notion
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { OnboardingHeader } from './OnboardingHeader';
import { EnhancedProgressIndicator } from './EnhancedProgressIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedOnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  showSkip?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  className?: string;
}

export function EnhancedOnboardingLayout({
  children,
  currentStep,
  totalSteps = 10,
  onBack,
  onNext,
  onSkip,
  showBack = true,
  showSkip = true,
  nextLabel = 'Continue',
  nextDisabled = false,
  className,
}: EnhancedOnboardingLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen gradient-onboarding-bg',
      className
    )}>
      {/* Header */}
      <OnboardingHeader onSkip={onSkip} showSkip={showSkip} />

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Progress Indicator */}
        <div className="mb-12">
          <EnhancedProgressIndicator currentStep={currentStep} />
        </div>

        {/* Content Area */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border shadow-elevation-lg">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <div className="w-32">
              {showBack && currentStep > 1 && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
              )}
            </div>

            {/* Step Counter */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Step <span className="font-semibold text-foreground">{currentStep}</span> of {totalSteps}
              </p>
            </div>

            {/* Next/Continue Button */}
            <div className="w-32 flex justify-end">
              <Button
                size="lg"
                onClick={onNext}
                disabled={nextDisabled}
                className="bg-gradient-to-r from-(--ai-primary) to-(--ai-accent) hover:from-(--ai-secondary) hover:to-(--ai-accent) text-white shadow-ai transition-all duration-300 hover:shadow-ai-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nextLabel}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

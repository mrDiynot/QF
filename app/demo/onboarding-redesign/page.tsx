'use client';

/**
 * Onboarding Redesign Demo
 * Public showcase of the new competitive design
 * No authentication required
 */

import { useState } from 'react';
import { BusinessType } from '@/types/onboarding';
import {
  EnhancedOnboardingLayout,
  EnhancedStep1Industry,
} from '@/components/onboarding';
import { toast } from 'sonner';

export default function OnboardingRedesignDemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!businessType) {
      toast.error('Please select a business type to continue');
      return;
    }
    
    toast.success(`Selected: ${businessType}`);
    // Demo mode - just show success
  };

  const handleSkip = () => {
    toast.info('This is a demo - skip functionality disabled');
  };

  return (
    <div className="min-h-screen">
      <EnhancedOnboardingLayout
        currentStep={currentStep}
        totalSteps={10}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={handleSkip}
        showBack={currentStep > 1}
        nextDisabled={!businessType}
      >
        <EnhancedStep1Industry
          value={businessType}
          onChange={setBusinessType}
        />
      </EnhancedOnboardingLayout>
    </div>
  );
}

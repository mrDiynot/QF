'use client';

/**
 * Enhanced Onboarding Preview
 * Demonstrates the new competitive redesign
 * Route: /onboarding-preview
 */

import { useState } from 'react';
import { BusinessType } from '@/types/onboarding';
import {
  EnhancedOnboardingLayout,
  EnhancedStep1Industry,
} from '@/components/onboarding';
import { toast } from 'sonner';

export default function OnboardingPreviewPage() {
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
    // In real implementation, would move to next step
    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    toast.info('Skipping setup...');
    // In real implementation, would redirect to dashboard
  };

  return (
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
  );
}

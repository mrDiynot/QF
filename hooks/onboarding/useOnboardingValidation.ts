'use client';

/**
 * Onboarding form validation hook
 * Provides step-by-step validation with inline error messages
 */

import { useState, useCallback } from 'react';
import type { OnboardingFormData } from '@/types/onboarding';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation rules for each onboarding step (11 steps per Figma)
 */
const validateStep = (step: number, formData: OnboardingFormData): StepValidation => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 1: // Business Type
      if (!formData.businessType && !formData.industry) {
        errors.push({ field: 'businessType', message: 'Please select your business type' });
      }
      break;

    case 2: // Goals (multi-select)
      if (!formData.goals || formData.goals.length === 0) {
        errors.push({ field: 'goals', message: 'Please select at least one goal' });
      }
      break;

    case 3: // Lead Capture Sources
      if (!formData.leadCaptureSources || formData.leadCaptureSources.length === 0) {
        errors.push({ field: 'leadCaptureSources', message: 'Please select at least one lead source' });
      }
      break;

    case 4: // Channels
      if (formData.channels.length === 0) {
        errors.push({ field: 'channels', message: 'Please select at least one channel' });
      }
      break;

    case 5: // Lead Type
      if (!formData.leadType) {
        errors.push({ field: 'leadType', message: 'Please select your lead type' });
      }
      break;

    case 6: // CRM
      if (!formData.crm) {
        errors.push({ field: 'crm', message: 'Please select a CRM option' });
      }
      break;

    case 7: // Team Size
      if (!formData.teamSize) {
        errors.push({ field: 'teamSize', message: 'Please select your team size' });
      }
      break;

    case 8: // Phone Setup
      if (!formData.phoneSetup.type) {
        errors.push({ field: 'phoneSetup.type', message: 'Please select a phone setup option' });
      }
      break;

    case 9: // Business Hours - Has defaults, optional
      break;

    case 10: // Calendar Integration
      if (!formData.calendarProvider) {
        errors.push({ field: 'calendarProvider', message: 'Please select a calendar option' });
      }
      break;

    case 11: // Onboarding Support - Optional (always has default value)
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Hook for onboarding form validation
 */
export function useOnboardingValidation(formData: OnboardingFormData) {
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(new Set());

  /**
   * Mark a step as attempted (user tried to proceed)
   */
  const markStepAttempted = useCallback((step: number) => {
    setAttemptedSteps((prev) => new Set(prev).add(step));
  }, []);

  /**
   * Get validation for a specific step
   */
  const getStepValidation = useCallback(
    (step: number): StepValidation => {
      return validateStep(step, formData);
    },
    [formData]
  );

  /**
   * Check if a step is valid
   */
  const isStepValid = useCallback(
    (step: number): boolean => {
      return validateStep(step, formData).isValid;
    },
    [formData]
  );

  /**
   * Get errors for a specific step (only if attempted)
   */
  const getStepErrors = useCallback(
    (step: number): ValidationError[] => {
      if (!attemptedSteps.has(step)) return [];
      return validateStep(step, formData).errors;
    },
    [formData, attemptedSteps]
  );

  /**
   * Get error for a specific field (only if step was attempted)
   */
  const getFieldError = useCallback(
    (step: number, fieldName: string): string | null => {
      if (!attemptedSteps.has(step)) return null;
      const validation = validateStep(step, formData);
      const error = validation.errors.find((e) => e.field === fieldName);
      return error?.message || null;
    },
    [formData, attemptedSteps]
  );

  /**
   * Validate current step and return whether user can proceed
   */
  const validateAndProceed = useCallback(
    (step: number): boolean => {
      markStepAttempted(step);
      return validateStep(step, formData).isValid;
    },
    [formData, markStepAttempted]
  );

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setAttemptedSteps(new Set());
  }, []);

  return {
    markStepAttempted,
    getStepValidation,
    isStepValid,
    getStepErrors,
    getFieldError,
    validateAndProceed,
    resetValidation,
    attemptedSteps,
  };
}


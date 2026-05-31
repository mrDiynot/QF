/**
 * Onboarding wizard state management
 */

import { create } from 'zustand';
import { BusinessProfileData, ChannelSetupData, AIConfigurationData } from '@/types/onboarding';

interface OnboardingState {
  currentStep: number;
  businessProfile: BusinessProfileData | null;
  channelSetup: ChannelSetupData | null;
  aiConfiguration: AIConfigurationData | null;
  setCurrentStep: (step: number) => void;
  setBusinessProfile: (data: BusinessProfileData) => void;
  setChannelSetup: (data: ChannelSetupData) => void;
  setAIConfiguration: (data: AIConfigurationData) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  businessProfile: null,
  channelSetup: null,
  aiConfiguration: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  setBusinessProfile: (data) => set({ businessProfile: data }),
  setChannelSetup: (data) => set({ channelSetup: data }),
  setAIConfiguration: (data) => set({ aiConfiguration: data }),
  reset: () => set({
    currentStep: 1,
    businessProfile: null,
    channelSetup: null,
    aiConfiguration: null,
  }),
}));
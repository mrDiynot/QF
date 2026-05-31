import { Metadata } from 'next';
import { OnboardingWizardNew } from '@/components/onboarding/OnboardingWizardNew';

export const metadata: Metadata = {
  title: 'Onboarding | Qualiflow AI',
  description: 'Set up your Qualiflow AI workspace',
};

export default function OnboardingPage() {
  return <OnboardingWizardNew />;
}
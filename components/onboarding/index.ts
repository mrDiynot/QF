/**
 * Onboarding Components
 * Re-exports all onboarding and wizard related components
 *
 * ACTIVE STEP FLOW (11-step Figma design):
 * 1. Step1Industry - Business type selection (9 categories)
 * 2. Step2Goals - Goals multi-select (7 options)
 * 3. Step3LeadSources - Lead capture sources (6 options)
 * 4. Step6Channels - Communication channels (7 options)
 * 5. Step4LeadType - B2B/B2C/Both selection
 * 6. Step3CRM - CRM platform selection (12 options)
 * 7. Step2TeamSize - Team size selection
 * 8. Step8PhoneSetup - Phone setup configuration
 * 9. Step9BusinessHours - Business hours configuration
 * 10. Step10Calendar - Calendar integration
 * 11. Step11OnboardingSupport - Optional onboarding support upsell
 *
 * LEGACY COMPONENTS (not used in current flow, kept for reference):
 * - Step1BusinessProfile, Step2ChannelSetup, Step3AIConfiguration
 * - Step4Completion, Step5Objective, Step7Automations
 * - Step9CallHandling, Step10FinalTouches
 */

export {
  StepWizard,
  OnboardingChecklist,
  FeatureHighlight,
  WelcomeBanner,
  TipCard,
  ProgressCard,
} from './OnboardingComponents';

// Step components (11-step flow per Figma)
export { Step1Industry } from './Step1Industry';
export { Step2Goals } from './Step2Goals';
export { Step3LeadSources } from './Step3LeadSources';
export { Step4LeadType } from './Step4LeadType';
export { Step6Channels } from './Step6Channels';
export { Step3CRM } from './Step3CRM';
export { Step2TeamSize } from './Step2TeamSize';
export { Step8PhoneSetup } from './Step8PhoneSetup';
export { Step9BusinessHours } from './Step9BusinessHours';
export { Step10Calendar } from './Step10Calendar';
export { Step11OnboardingSupport } from './Step11OnboardingSupport';

// AI-powered components
export { AIRecommendationsPanel } from './AIRecommendationsPanel';

// Wizard and celebration
export { OnboardingWizard } from './OnboardingWizard';
export { OnboardingWizardNew } from './OnboardingWizardNew';
export { OnboardingCelebration } from './OnboardingCelebration';
export { ProgressIndicator } from './ProgressIndicator';
export { ProgressBreadcrumb } from './ProgressBreadcrumb';
export { LiveAIPreview } from './LiveAIPreview';

// Enhanced competitive redesign components (2025)
export { EnhancedBusinessTypeCard } from './EnhancedBusinessTypeCard';
export { EnhancedStep1Industry } from './EnhancedStep1Industry';
export { EnhancedProgressIndicator } from './EnhancedProgressIndicator';
export { EnhancedOnboardingLayout } from './EnhancedOnboardingLayout';
export { OnboardingHeader } from './OnboardingHeader';
export { OnboardingHero } from './OnboardingHero';
export { AIBadge } from './AIBadge';

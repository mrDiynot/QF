'use client';

/**
 * Step 3: CRM Selection
 * Allows users to select their CRM platform
 * Premium CRM integrations (HubSpot, Salesforce) are gated by subscription
 */

import { useEffect } from 'react';
import { CRMPlatform } from '@/types/onboarding';
import { OptionCard } from './shared/OptionCard';
import { RecommendedBadge } from './shared/RecommendedBadge';
import { UpgradeBadge } from './shared/UpgradeBadge';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { toast } from 'sonner';

interface Step3CRMProps {
  value: CRMPlatform | '';
  onChange: (value: CRMPlatform) => void;
}

/**
 * CRM options with feature key mapping for subscription gating
 *
 * Available database features: ai_email, ai_sms, ai_voice, webchat, instagram,
 * facebook, whatsapp, custom_branding, api_access, dedicated_support
 *
 * CRM Integration Tiers (based on useFeatureAccess.ts mapping):
 * - FreeFlow: Built-In CRM, Monday, Close, FreshSales, ActiveCampaign, Copper, Other
 * - SmartFlow+: HubSpot, Zoho, Pipedrive (standard CRM integrations)
 * - UltraFlow+: GoHighLevel, Salesforce (enterprise/API-heavy integrations via api_access)
 */
const crmOptions: Array<{
  value: CRMPlatform;
  label: string;
  description: string;
  emoji: string;
  featureKey?: string;
  recommended?: boolean;
}> = [
  // UltraFlow+ (require api_access feature)
  { value: 'hubspot', label: 'HubSpot', description: 'All-in-one platform', emoji: '🔶', featureKey: 'api_access' },
  { value: 'zoho', label: 'Zoho CRM', description: 'Affordable & powerful', emoji: '📊', featureKey: 'api_access' },
  { value: 'pipedrive', label: 'Pipedrive', description: 'Sales-focused CRM', emoji: '⚡', featureKey: 'api_access' },
  { value: 'gohighlevel', label: 'GoHighLevel', description: 'Agency platform', emoji: '⚙️', featureKey: 'api_access' },
  // Available on all plans (no featureKey = no restriction)
  { value: 'monday', label: 'Monday CRM', description: 'Visual workflow', emoji: '🎯' },
  { value: 'close', label: 'Close CRM', description: 'Built for sales', emoji: '📞' },
  { value: 'freshsales', label: 'FreshSales', description: 'Intuitive CRM', emoji: '🌿' },
  { value: 'activecampaign', label: 'ActiveCampaign', description: 'Marketing automation', emoji: '✉️' },
  { value: 'copper', label: 'Copper', description: 'Google-integrated', emoji: '🔶' },
  // Enterprise CRM (api_access required)
  { value: 'salesforce', label: 'Salesforce', description: 'Enterprise leader', emoji: '☁️', featureKey: 'api_access' },
  // Available on all plans (recommended)
  { value: 'builtin', label: 'Built-In CRM', description: 'Qualiflow AI CRM (recommended)', emoji: '✨', recommended: true },
  { value: 'other', label: 'Other CRM', description: 'Custom integration', emoji: '➕' },
];

export function Step3CRM({ value, onChange }: Step3CRMProps) {
  const { hasFeatureAccess, getUpgradeMessage, hasError, error } = useFeatureAccess();

  const isCrmLocked = (featureKey?: string): boolean => {
    if (!featureKey) return false;
    // If there's an error loading features, don't lock anything - let user proceed
    if (hasError) return false;
    return !hasFeatureAccess(featureKey);
  };

  // Show error notification if features couldn't be loaded
  useEffect(() => {
    if (hasError && error) {
      toast.error(error, {
        duration: 8000,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [hasError, error]);

  const handleCrmSelect = (crm: typeof crmOptions[0]) => {
    if (crm.featureKey && isCrmLocked(crm.featureKey)) {
      toast.info(getUpgradeMessage(crm.featureKey), {
        action: {
          label: 'View Plans',
          onClick: () => window.open('/pricing', '_blank'),
        },
      });
      return;
    }
    onChange(crm.value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">Connect your CRM</h2>
        <p className="body-text mt-2 text-gray-text">
          Select your CRM platform for seamless integration. Built-In CRM is recommended for the fastest setup.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crmOptions.map((crm) => {
          const isLocked = isCrmLocked(crm.featureKey);
          return (
            <OptionCard
              key={crm.value}
              emoji={crm.emoji}
              title={crm.label}
              subtitle={crm.description}
              selected={value === crm.value && !isLocked}
              onClick={() => handleCrmSelect(crm)}
              variant={crm.recommended ? 'recommended' : isLocked ? 'locked' : 'default'}
              badge={crm.recommended ? <RecommendedBadge /> : isLocked ? <UpgradeBadge /> : undefined}
              disabled={isLocked}
            />
          );
        })}
      </div>
    </div>
  );
}
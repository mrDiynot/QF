'use client';

/**
 * Step 9: Call Handling Configuration
 * Configures SMS on missed calls and outbound AI calling
 * Features are gated based on subscription plan
 */

import { MessageSquare, Phone, Sparkles } from 'lucide-react';
import { FeatureOption } from './shared/FeatureOption';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';

interface Step9CallHandlingProps {
  value: {
    forwardNumber?: string;
    sendSMSOnMissed: boolean;
    enableOutboundAI: boolean;
  };
  onChange: (value: {
    forwardNumber?: string;
    sendSMSOnMissed: boolean;
    enableOutboundAI: boolean;
  }) => void;
}

export function Step9CallHandling({ value, onChange }: Step9CallHandlingProps) {
  const { hasFeatureAccess } = useFeatureAccess();

  // Check if features are available in current plan
  // Database feature keys: ai_sms, ai_voice (not voice_outbound)
  const hasSmsAccess = hasFeatureAccess('ai_sms');
  const hasOutboundAccess = hasFeatureAccess('ai_voice');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-2 text-text-navy">Configure call handling</h2>
        <p className="body-text mt-2 text-gray-text">
          Set up how Qualiflow AI AI should handle incoming calls and missed calls.
        </p>
      </div>

      <div className="space-y-5">
        {/* Send SMS on missed calls */}
        <FeatureOption
          id="sms-on-missed"
          featureKey="ai_sms"
          title="Send SMS on missed calls"
          description="Automatically text customers when you miss their call"
          icon={<MessageSquare className="w-6 h-6" />}
          isSelected={value.sendSMSOnMissed && hasSmsAccess}
          onSelect={() => onChange({ ...value, sendSMSOnMissed: !value.sendSMSOnMissed })}
          isToggle
        />

        {/* Enable outbound AI calling */}
        <FeatureOption
          id="outbound-ai"
          featureKey="ai_voice"
          title="Enable outbound AI calling"
          description="Allow AI to make outbound calls to leads"
          icon={<Phone className="w-6 h-6" />}
          isSelected={value.enableOutboundAI && hasOutboundAccess}
          onSelect={() => onChange({ ...value, enableOutboundAI: !value.enableOutboundAI })}
          isToggle
        />
      </div>

      {/* Active features summary */}
      {((value.sendSMSOnMissed && hasSmsAccess) || (value.enableOutboundAI && hasOutboundAccess)) && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4" />
            {[
              value.sendSMSOnMissed && hasSmsAccess && 'SMS',
              value.enableOutboundAI && hasOutboundAccess && 'Outbound AI'
            ].filter(Boolean).join(' + ')} enabled
          </div>
        </div>
      )}
    </div>
  );
}
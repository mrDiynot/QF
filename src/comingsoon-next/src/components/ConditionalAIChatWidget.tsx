'use client';

import { usePrivacyConsent } from '@/contexts/PrivacyConsentContext';
import { AIChatWidget } from './AIChatWidget';

interface ConditionalAIChatWidgetProps {
  widgetKey: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

export function ConditionalAIChatWidget({ widgetKey, position, primaryColor }: ConditionalAIChatWidgetProps) {
  const { canUseAiChat, hasConsented } = usePrivacyConsent();

  // Only render AI chat if user has consented AND enabled AI chat
  if (!hasConsented || !canUseAiChat) {
    return null;
  }

  return (
    <AIChatWidget
      widgetKey={widgetKey}
      position={position}
      primaryColor={primaryColor}
    />
  );
}

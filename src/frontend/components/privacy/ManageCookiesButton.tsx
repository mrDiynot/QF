'use client';

import { Settings } from 'lucide-react';
import { usePrivacyConsent } from '@/contexts/PrivacyConsentContext';

export function ManageCookiesButton() {
  const { openPreferences } = usePrivacyConsent();

  return (
    <button
      onClick={openPreferences}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
    >
      <Settings className="w-4 h-4" />
      Manage Cookie Preferences
    </button>
  );
}

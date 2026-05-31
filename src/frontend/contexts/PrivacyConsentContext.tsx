'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Consent version — increment when adding new categories
const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'qualiflow_privacy_consent';

export interface ConsentCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  aiChat: boolean;
}

export interface PrivacyConsent {
  version: string;
  timestamp: string;
  categories: ConsentCategories;
  source: 'accept_all' | 'reject_all' | 'custom';
}

interface PrivacyConsentContextValue {
  consent: PrivacyConsent | null;
  hasConsented: boolean;
  canUseAiChat: boolean;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  showBanner: boolean;
  showPreferencesModal: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveCustom: (categories: Partial<ConsentCategories>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextValue | undefined>(undefined);

export function usePrivacyConsent() {
  const context = useContext(PrivacyConsentContext);
  if (context === undefined) {
    throw new Error('usePrivacyConsent must be used within a PrivacyConsentProvider');
  }
  return context;
}

interface PrivacyConsentProviderProps {
  children: ReactNode;
}

export function PrivacyConsentProvider({ children }: PrivacyConsentProviderProps) {
  const [consent, setConsent] = useState<PrivacyConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PrivacyConsent;
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed);
          setShowBanner(false);
        } else {
          // Version mismatch — re-consent required
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
    setIsHydrated(true);
  }, []);

  const saveConsent = useCallback((newConsent: PrivacyConsent) => {
    setConsent(newConsent);
    setShowBanner(false);
    setShowPreferencesModal(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    } catch (e) {
      console.error('Failed to save consent to localStorage:', e);
    }
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: { essential: true, analytics: true, marketing: true, aiChat: true },
      source: 'accept_all',
    });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: { essential: true, analytics: false, marketing: false, aiChat: false },
      source: 'reject_all',
    });
  }, [saveConsent]);

  const saveCustom = useCallback((categories: Partial<ConsentCategories>) => {
    saveConsent({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      categories: {
        essential: true,
        analytics: categories.analytics ?? false,
        marketing: categories.marketing ?? false,
        aiChat: categories.aiChat ?? false,
      },
      source: 'custom',
    });
  }, [saveConsent]);

  const openPreferences = useCallback(() => setShowPreferencesModal(true), []);
  const closePreferences = useCallback(() => setShowPreferencesModal(false), []);

  const hasConsented = consent !== null;
  const canUseAiChat = consent?.categories.aiChat ?? false;
  const canUseAnalytics = consent?.categories.analytics ?? false;
  const canUseMarketing = consent?.categories.marketing ?? false;

  // Don't show banner until hydrated — prevents flash on first render
  const effectiveShowBanner = isHydrated && showBanner;

  return (
    <PrivacyConsentContext.Provider value={{
      consent,
      hasConsented,
      canUseAiChat,
      canUseAnalytics,
      canUseMarketing,
      showBanner: effectiveShowBanner,
      showPreferencesModal,
      acceptAll,
      rejectAll,
      saveCustom,
      openPreferences,
      closePreferences,
    }}>
      {children}
    </PrivacyConsentContext.Provider>
  );
}

'use client';

/**
 * Offline Resilience Hook for Onboarding
 * Saves form data to localStorage and syncs when online
 */

import { useEffect, useCallback, useRef } from 'react';
import type { OnboardingFormData } from '@/types/onboarding';

const STORAGE_KEY = 'qualiflow_onboarding_draft';
const PENDING_SYNC_KEY = 'qualiflow_onboarding_pending_sync';

interface StoredData {
  formData: OnboardingFormData;
  currentStep: number;
  savedAt: string;
}

interface PendingSyncData {
  type: 'business_profile' | 'channel_setup' | 'ai_configuration';
  data: Record<string, unknown>;
  createdAt: string;
}

/**
 * Hook to persist onboarding form data locally for offline resilience
 */
export function useOfflineResilience(
  formData: OnboardingFormData,
  currentStep: number,
  onRestoreData?: (data: OnboardingFormData, step: number) => void
) {
  const isInitialized = useRef(false);

  // Save data to localStorage on every change
  useEffect(() => {
    if (!isInitialized.current) return; // Skip initial mount

    const storedData: StoredData = {
      formData,
      currentStep,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    } catch {
      // localStorage might be full or unavailable
      console.warn('Failed to save onboarding draft to localStorage');
    }
  }, [formData, currentStep]);

  // Restore data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && onRestoreData) {
        const { formData: savedFormData, currentStep: savedStep } = JSON.parse(stored) as StoredData;
        // Only restore if there's meaningful data
        if (savedFormData && (savedFormData.industry || savedFormData.channels?.length > 0)) {
          onRestoreData(savedFormData, savedStep);
        }
      }
    } catch {
      console.warn('Failed to restore onboarding draft from localStorage');
    }
    isInitialized.current = true;
  }, [onRestoreData]);

  // Clear saved data (call after successful completion)
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_SYNC_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  // Queue failed API call for retry
  const queueForSync = useCallback((type: PendingSyncData['type'], data: Record<string, unknown>) => {
    try {
      const pending: PendingSyncData = {
        type,
        data,
        createdAt: new Date().toISOString(),
      };
      const existing = localStorage.getItem(PENDING_SYNC_KEY);
      const queue: PendingSyncData[] = existing ? JSON.parse(existing) : [];
      queue.push(pending);
      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    } catch {
      console.warn('Failed to queue sync data');
    }
  }, []);

  // Get pending sync items
  const getPendingSyncItems = useCallback((): PendingSyncData[] => {
    try {
      const pending = localStorage.getItem(PENDING_SYNC_KEY);
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  }, []);

  // Clear pending sync queue after successful sync
  const clearPendingSyncItems = useCallback(() => {
    try {
      localStorage.removeItem(PENDING_SYNC_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  // Check if online
  const isOnline = useCallback(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }, []);

  return {
    clearSavedData,
    queueForSync,
    getPendingSyncItems,
    clearPendingSyncItems,
    isOnline,
  };
}

/**
 * Hook to listen for online/offline status changes
 */
export function useNetworkStatus(onOnline?: () => void, onOffline?: () => void) {
  useEffect(() => {
    const handleOnline = () => onOnline?.();
    const handleOffline = () => onOffline?.();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}


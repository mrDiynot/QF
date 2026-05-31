'use client';

import { useState, useEffect } from 'react';
import { X, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureComingSoonProps {
  featureName: string;
  description?: string;
  storageKey: string;
}

/**
 * Dismissible banner component for features without backend APIs
 * Shows "Coming Soon" message that can be dismissed for the session
 */
export function FeatureComingSoon({ 
  featureName, 
  description = 'Backend API in development',
  storageKey 
}: FeatureComingSoonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this banner in current session
    const isDismissed = sessionStorage.getItem(storageKey) === 'true';
    setIsVisible(!isDismissed);
  }, [storageKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-yellow-400">
          <Rocket className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-orange-900">
            {featureName} - Preview Mode
          </h3>
          <p className="mt-1 text-sm text-orange-700">
            {description}. You&apos;re viewing a preview with sample data. Full functionality coming soon!
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="shrink-0 text-orange-600 hover:bg-orange-100 hover:text-orange-900"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
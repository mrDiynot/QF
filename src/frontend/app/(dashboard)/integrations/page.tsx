'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Integrations Page - Redirects to System Settings > Integrations
 *
 * This page exists for backwards compatibility and SEO.
 * The actual integrations management is now under /settings/system#integrations
 */
export default function IntegrationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the consolidated integrations page under system settings
    router.replace('/settings/system?tab=integrations');
  }, [router]);

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 text-center py-20">
          <p className="body-text text-text-secondary">
            Redirecting to System Settings...
          </p>
        </div>
      </div>
    </div>
  );
}
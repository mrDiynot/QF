'use client';

/**
 * Integrations Settings Page
 * 
 * Dedicated page for managing third-party integrations (CRM, Calendar, etc.)
 * Previously part of System Settings > Integrations tab.
 */

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { IntegrationsSection } from '@/components/settings/IntegrationsSection';

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-2">
          Connect QualiFlow AI with your favorite CRM, calendar, and business tools to streamline your workflow.
        </p>
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <IntegrationsSection />
      </Suspense>
    </div>
  );
}


'use client';

/**
 * Webhooks Settings Page
 * 
 * Dedicated page for webhook management with improved UX and performance.
 * Previously part of System Settings > API & Webhooks tab.
 */

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WebhooksSection } from '@/components/settings/WebhooksSection';

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-500 mt-2">
          Configure webhook endpoints to receive real-time notifications when events occur in your account.
        </p>
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <WebhooksSection />
      </Suspense>
    </div>
  );
}


'use client';

/**
 * System Settings Page - Optimized
 *
 * Performance optimizations applied:
 * 1. Removed blocking full-page loader
 * 2. Added lazy loading for tab components
 * 3. Added React Query caching with staleTime
 * 4. Removed redundant AI Configuration tab (use /settings/ai-training)
 * 5. Removed redundant API Keys section (use /settings/api-keys)
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Webhook,
  Zap,
  ArrowRight,
  Brain,
  Key,
} from 'lucide-react';
import Link from 'next/link';

// Lazy load tab components for better performance
const WebhooksSection = dynamic(
  () => import('@/components/settings/WebhooksSection').then(m => ({ default: m.WebhooksSection })),
  {
    ssr: false,
    loading: () => <TabSkeleton />
  }
);

const IntegrationsSection = dynamic(
  () => import('@/components/settings/IntegrationsSection').then(m => ({ default: m.IntegrationsSection })),
  {
    ssr: false,
    loading: () => <TabSkeleton />
  }
);

// Skeleton loader for tabs
function TabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

// Quick link card component for redirecting to dedicated pages
function QuickLinkCard({
  icon: Icon,
  title,
  description,
  href,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="size-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
          <Button asChild variant="link" className="p-0 h-auto mt-3 gap-2">
            <Link href={href}>
              Go to {title}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function SystemSettingsPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('webhooks');

  // Handle tab from URL query parameter (for redirects from /integrations)
  useEffect(() => {
    if (tabFromUrl === 'integrations') {
      setActiveTab('integrations');
    }
  }, [tabFromUrl]);

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-text-navy">System Settings</h1>
        <p className="text-base mt-3 text-text-secondary">
          Manage webhooks, integrations, and technical configurations
        </p>
      </div>

      {/* Quick Links to Dedicated Pages */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <QuickLinkCard
          icon={Brain}
          title="AI Training"
          description="Configure AI tone, personality, BANT scoring weights, and test your AI model"
          href="/settings/ai-training"
          color="bg-purple-100 text-purple-600"
        />
        <QuickLinkCard
          icon={Key}
          title="API Keys"
          description="Create and manage API keys for external integrations and developer access"
          href="/settings/api-keys"
          color="bg-blue-100 text-blue-600"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="size-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="size-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Suspense fallback={<TabSkeleton />}>
            <WebhooksSection />
          </Suspense>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Suspense fallback={<TabSkeleton />}>
            <IntegrationsSection />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

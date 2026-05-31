'use client';

/**
 * AI Readiness Page
 * Comprehensive view of business AI readiness status and checklist
 */

import { Suspense } from 'react';
import { ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AIReadinessChecklist } from '@/components/ai-readiness/AIReadinessChecklist';
import { useAIReadiness } from '@/hooks/api/useAIReadiness';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function AIReadinessContent() {
  const { data, isLoading, refetch } = useAIReadiness();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load AI readiness data</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <AIReadinessChecklist 
      data={data} 
      showNextActions={true}
      onRefresh={() => refetch()}
    />
  );
}

export default function AIReadinessPage() {
  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-6 text-purple-600" />
                <h1 className="heading-1 text-text-navy">AI Readiness Checklist</h1>
              </div>
              <p className="body-text mt-1 text-text-secondary">
                Complete these steps to unlock 100% AI-driven lead qualification
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="size-5 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  This checklist guides you through all the steps needed to fully leverage 
                  QualiFlow AI&apos;s AI capabilities including lead qualification, auto-responses, 
                  and intelligent routing.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Main Content */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <AIReadinessContent />
        </Suspense>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            Why Complete This Checklist?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">🎯 Better Lead Scoring</h4>
              <p>AI uses your business context to accurately score leads using BANT criteria.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">⚡ Faster Response Times</h4>
              <p>Configured AI can automatically respond to leads within seconds, 24/7.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">📈 Higher Conversion</h4>
              <p>Properly qualified leads convert 3x better than unqualified ones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

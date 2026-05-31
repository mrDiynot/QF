'use client';

import { useState } from 'react';
import {
  MessageSquare, Brain, Radio,
  Zap, Phone, Target
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useDashboardMetrics, useDashboardDateRange, DATE_RANGE_PRESETS, useLeads } from '@/hooks/api';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { useChannels } from '@/hooks/api/useChannels';
import { useAIReadiness } from '@/hooks/api/useAIReadiness';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/dashboard/BentoGrid';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { LiveConversationStream } from '@/components/dashboard/LiveConversationStream';
import { AIInsightsWidget } from '@/components/dashboard/AIInsightsWidget';
import { ChannelActivityMonitor } from '@/components/dashboard/ChannelActivityMonitor';
import { AIPerformanceWidget } from '@/components/dashboard/AIPerformanceWidget';
import { AIQuickActionsWidget } from '@/components/dashboard/AIQuickActionsWidget';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { AIReadinessBanner } from '@/components/ai-readiness/AIReadinessBanner';
import { AIReadinessChecklist } from '@/components/ai-readiness/AIReadinessChecklist';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

/**
 * Enhanced Dashboard - Competitive Redesign
 * Inspired by Linear, Stripe, Notion, and Vercel
 * Features:
 * - Bento Grid layout with variable-sized cards
 * - AI-first messaging throughout
 * - Live conversation stream
 * - Trend indicators on all metrics
 * - Smart insights and suggestions
 */
export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } = useOnboardingStatus();
  useChannels(); // Prefetch
  const { data: aiReadiness, isLoading: isLoadingAIReadiness } = useAIReadiness();
  const [dismissedAIBanner, setDismissedAIBanner] = useState(false);
  const { preset, startDate, endDate } = useDashboardDateRange();
  
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  const { data: dashboardData, isLoading, error } = useDashboardMetrics(startDateStr, endDateStr);
  const { data: recentLeadsData } = useLeads({ pageSize: 5 });
  
  const dateRangeLabel = DATE_RANGE_PRESETS.find(p => p.value === preset)?.label || '30 Days';

  // Loading state — only block on dashboard metrics fetch
  if (isLoading) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="shimmer h-16 w-96 rounded-3xl bg-white/10" />
          <BentoGrid>
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </BentoGrid>
        </div>
      </div>
    );
  }

  // On network error (backend down in dev) fall through with empty data instead of blocking
  const safeData = error ? null : dashboardData;

  const firstName = session?.user?.firstName || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Check if user just completed onboarding (within last 24 hours)
  const isNewUser = onboardingStatus?.isComplete && onboardingStatus?.completedAt
    ? new Date(onboardingStatus.completedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    : false;

  // Helper to format response time
  function formatResponseTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${(seconds / 3600).toFixed(1)}h`;
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Clean Header */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              {/* Greeting */}
              <p className="text-sm text-purple-300 mb-2">
                {greeting}, {firstName}
              </p>
              
              {/* Main Title - Simple & Clean */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight tracking-tight text-white">
                Dashboard Overview
              </h1>
              
              <p className="text-sm lg:text-base text-purple-300 max-w-2xl mb-4">
                Welcome back! Here&apos;s what&apos;s happening with your customer journey.
              </p>
              
              {/* Date Range Picker */}
              <DateRangePicker />
            </div>
          </div>
        </div>

      /*
        {/* AI Readiness Banner */}
        {aiReadiness && !aiReadiness.score.isFullyReady && !dismissedAIBanner && (
          <AIReadinessBanner
            data={aiReadiness}
            onDismiss={() => setDismissedAIBanner(true)}
            variant="default"
            onboardingCallScheduled={onboardingStatus?.onboardingCallScheduled}
            onboardingCallScheduledAt={onboardingStatus?.onboardingCallScheduledAt}
          />
        )}

        {/* Dashboard Overview - Stats, Recent Leads, Active Journeys */}
        <DashboardOverview
          metrics={safeData ?? null}
          recentLeads={recentLeadsData}
          dateRangeLabel={dateRangeLabel}
        />
      
         {/* Bento Grid Layout */}
       
          {/* Row 1: Live Conversation Stream (2 cols) + AI Insights (2 cols) */}
         

          

        
        
        
          {/* Row 4: AI Readiness Checklist (for new users) or Quick Actions */}
          {isNewUser && aiReadiness && !aiReadiness.score.isFullyReady ? (
            <BentoCard colSpan={4}>
              <AIReadinessChecklist 
                data={aiReadiness} 
                highlightDeferredSetup={true}
                showNextActions={true}
              />
            </BentoCard>
          ) : (
            <BentoCard colSpan={4}>
              <BentoCardHeader
                icon={<Zap className="size-5 text-orange-400" />}
                title="Quick Actions"
                subtitle="Common tasks"
              />
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <Link
                  href="/channels"
                  className="p-4 bg-gradient-to-br from-orange-500 to-orange-1100 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-3 border border-white/10"
                >
                  <MessageSquare className="size-6" />
                  <div className="text-left">
                    <div className="text-sm opacity-90">Manage</div>
                    <div className="font-semibold">Lead Channels</div>
                  </div>
                </Link>
                <Link
                  href="/channels/voice"
                  className="p-4 bg-gradient-to-br from-purple-500 to-orange-950 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-3 border border-white/10"
                >
                  <Phone className="size-6" />
                  <div className="text-left">
                    <div className="text-sm opacity-90">Configure</div>
                    <div className="font-semibold">AI Calling</div>
                  </div>
                </Link>
                <Link
                  href="/analytics"
                className="p-4 bg-gradient-to-br from-blue-500 to-white-700 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-3 border border-white/10"
                >
                  <Target className="size-6" />
                  <div className="text-left">
                    <div className="text-sm opacity-90">View</div>
                    <div className="font-semibold">Full Analytics</div>
                  </div>
                </Link>
              </div>
            </BentoCard>
          )}
       
         
        {/* Bottom Action Bar - Subtle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 border border-white/10">
              <Phone className="size-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Need help?</h3>
              <p className="text-xs text-purple-300">Our support team is here to assist you</p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF6B35] hover:shadow-lg hover:shadow-orange-500/30 text-white text-sm font-medium transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
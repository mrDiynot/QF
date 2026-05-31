'use client';

import { useState } from 'react';
import {
  MessageSquare, Target, Clock, Sparkles, Brain, Radio,
  Zap, Phone
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useDashboardMetrics, useDashboardDateRange, DATE_RANGE_PRESETS } from '@/hooks/api';
import { useOnboardingStatus } from '@/hooks/onboarding/useOnboarding';
import { useChannels } from '@/hooks/api/useChannels';
import { useAIReadiness } from '@/hooks/api/useAIReadiness';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/dashboard/BentoGrid';
import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { LiveConversationStream } from '@/components/dashboard/LiveConversationStream';
import { AIInsightCard, AIInsightPanel } from '@/components/dashboard/AIInsightCard';
import { ChannelActivityMonitor } from '@/components/dashboard/ChannelActivityMonitor';
import { AIPerformanceWidget } from '@/components/dashboard/AIPerformanceWidget';
import { AIQuickActionsWidget } from '@/components/dashboard/AIQuickActionsWidget';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { AIReadinessBanner } from '@/components/ai-readiness/AIReadinessBanner';
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
export default function EnhancedDashboardPage() {
  const { data: session } = useSession();
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } = useOnboardingStatus();
  useChannels(); // Prefetch
  const { data: aiReadiness, isLoading: isLoadingAIReadiness } = useAIReadiness();
  const [dismissedAIBanner, setDismissedAIBanner] = useState(false);
  const { preset, startDate, endDate } = useDashboardDateRange();
  
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  const { data: dashboardData, isLoading, error } = useDashboardMetrics(startDateStr, endDateStr);
  
  const dateRangeLabel = DATE_RANGE_PRESETS.find(p => p.value === preset)?.label || '30 Days';

  // Loading state
  if (isLoading || isLoadingOnboarding || isLoadingAIReadiness) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="shimmer h-16 w-96 rounded-3xl bg-gray-100" />
          <BentoGrid>
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </BentoGrid>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-8">
            <p className="text-red-700 font-semibold text-lg">
              Failed to load dashboard data. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const firstName = session?.user?.firstName || 'there';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Helper to format response time
  function formatResponseTime(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
    return `${(seconds / 3600).toFixed(1)}h`;
  }

  // Calculate mock trends (in production, these would come from the API)
  const calculateTrend = (_current: number): { value: number; direction: 'up' | 'down' | 'neutral' } => {
    const change = Math.floor(Math.random() * 30) - 5; // Random trend for demo
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8 pt-4">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div>
              {/* AI Status Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 px-4 py-2 mb-4">
                <Sparkles className="size-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-700 tracking-wide">
                  {greeting}, {firstName}!
                </span>
              </div>
              
              {/* Main Title with Gradient */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  AI Command Center
                </span>
              </h1>
              
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl font-medium mb-4">
                Real-time insights, live conversations, and intelligent automation at your fingertips.
              </p>
              
              {/* Date Range Picker */}
              <DateRangePicker />
            </div>
            
            {/* Quick Actions */}
            {aiReadiness && !aiReadiness.score.isFullyReady && (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/ai-readiness"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all"
                >
                  <Sparkles className="size-4" />
                  Complete Setup ({aiReadiness.score.overallScore}%)
                </Link>
              </div>
            )}
          </div>
        </div>

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

        {/* Bento Grid Layout */}
        <BentoGrid>
          {/* Row 1: Primary Metrics (4 cards) */}
          <EnhancedMetricCard
            icon={<MessageSquare className="size-7" />}
            value={dashboardData?.totalConversations || 0}
            label="Active Conversations"
            sublabel="AI + Human"
            trend={calculateTrend(dashboardData?.totalConversations || 0)}
            href="/conversations"
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
          
          <EnhancedMetricCard
            icon={<Sparkles className="size-7" />}
            value={dashboardData?.totalLeads || 0}
            label="Leads Captured"
            sublabel="All channels"
            trend={calculateTrend(dashboardData?.totalLeads || 0)}
            href="/leads"
            iconColor="text-pink-600"
            iconBg="bg-pink-100"
          />
          
          <EnhancedMetricCard
            icon={<Target className="size-7" />}
            value={dashboardData?.conversionRate ? `${Number(dashboardData.conversionRate).toFixed(1)}%` : '0%'}
            label="AI Qualification"
            sublabel="Lead to qualified"
            trend={{ value: 8, direction: 'up' }}
            href="/leads?filter=qualified"
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
          
          <EnhancedMetricCard
            icon={<Clock className="size-7" />}
            value={dashboardData?.averageResponseTime && dashboardData.averageResponseTime > 0
              ? formatResponseTime(dashboardData.averageResponseTime)
              : '—'}
            label="Response Time"
            sublabel="AI average"
            trend={{ value: 12, direction: 'down' }}
            href="/analytics"
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />

          {/* Row 2: Live Conversation Stream (2 cols) + AI Insights (2 cols) */}
          <BentoCard colSpan={2} rowSpan={2} glowEffect>
            <BentoCardHeader
              icon={<MessageSquare className="size-5 text-purple-600" />}
              title="Live Conversations"
              subtitle={dateRangeLabel}
            />
            <LiveConversationStream />
          </BentoCard>

          <BentoCard colSpan={2} rowSpan={2} glowEffect>
            <BentoCardHeader
              icon={<Brain className="size-5 text-purple-600" />}
              title="AI Insights"
              subtitle="Powered by GPT-4"
            />
            <AIInsightPanel>
              <AIInsightCard
                type="suggestion"
                title="Improve Response Times"
                description="Your average response time increased by 15% this week. Consider enabling auto-responses for common questions."
                action={{
                  label: 'Enable Auto-Respond',
                  onClick: () => window.location.href = '/ai-templates',
                }}
                priority="high"
              />
              <AIInsightCard
                type="opportunity"
                title="High-Intent Leads Detected"
                description="3 leads asked about pricing in the last hour. They might be ready to convert."
                action={{
                  label: 'View Leads',
                  onClick: () => window.location.href = '/leads?filter=hot',
                }}
              />
              <AIInsightCard
                type="trend"
                title="WhatsApp Engagement Up 28%"
                description="WhatsApp conversations are trending upward. Consider investing more in this channel."
                action={{
                  label: 'View Analytics',
                  onClick: () => window.location.href = '/analytics',
                }}
              />
            </AIInsightPanel>
          </BentoCard>

          {/* Row 3: Quick Actions (2 cols) + AI Performance (2 cols) */}
          <BentoCard colSpan={2} interactive>
            <BentoCardHeader
              icon={<Radio className="size-5 text-blue-600" />}
              title="Quick Actions asjdha"
              subtitle={dateRangeLabel}
            />
            <ChannelActivityMonitor startDate={startDateStr} endDate={endDateStr} />
          </BentoCard>

          <BentoCard colSpan={2} interactive>
            <BentoCardHeader
              icon={<Brain className="size-5 text-purple-600" />}
              title="AI Performance"
              subtitle={dateRangeLabel}
            />
            <AIPerformanceWidget startDate={startDateStr} endDate={endDateStr} />
          </BentoCard>

          {/* Row 4: Quick Actions (full width) */}
          <BentoCard colSpan={4}>
            <BentoCardHeader
              icon={<Zap className="size-5 text-orange-600" />}
              title="Quick Actions"
              subtitle="Common tasks"
            />
            <AIQuickActionsWidget />
          </BentoCard>
        </BentoGrid>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Need help optimizing your AI?</h3>
              <p className="text-xs text-gray-600">Our team can help you get the most out of QualiFlow AI</p>
            </div>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
          >
            <Phone className="size-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

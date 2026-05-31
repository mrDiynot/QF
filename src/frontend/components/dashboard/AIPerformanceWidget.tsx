'use client';

/**
 * AI Performance Widget
 * Displays AI processing metrics and performance indicators
 * Uses graceful degradation - shows dashboard metrics even if AI usage API fails
 */

import { 
  Brain,
  Zap,
  CheckCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardMetrics, useAIUsage } from '@/hooks/api';

interface AIPerformanceWidgetProps {
  startDate?: string;
  endDate?: string;
}

export function AIPerformanceWidget({ startDate, endDate }: AIPerformanceWidgetProps = {}) {
  // Fetch AI usage with provided date range
  const { data: aiUsage, isLoading: isLoadingAI } = useAIUsage(startDate, endDate);

  // Fetch dashboard metrics with provided date range (shared cache with dashboard page)
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardMetrics(startDate, endDate);

  // Only show loading if BOTH are loading - otherwise show what we have
  if (isLoadingAI && isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  // Use AI usage data if available, otherwise show 0 (graceful degradation)
  const totalInteractions = aiUsage?.totalOpenAIRequests || 0;
  // Use totalConversations from backend (totalConversations is the correct field name)
  const totalConversations = dashboardData?.totalConversations || dashboardData?.activeConversations || 0;

  // AI Coverage: What percentage of conversations had AI assistance
  // This is more meaningful than comparing raw API calls to messages
  const aiCoverageRate = totalConversations > 0
    ? Math.min(100, Math.round((totalInteractions / totalConversations) * 100))
    : 0;

  const metrics = [
    {
      icon: <Brain className="size-5" />,
      label: 'AI Interactions',
      value: totalInteractions.toLocaleString(),
      sublabel: 'Last 30 days',
      iconColor: 'text-brand-orange',
      bgColor: 'bg-orange-50',
    },
    {
      icon: <Zap className="size-5" />,
      label: 'AI Coverage',
      value: `${aiCoverageRate}%`,
      sublabel: 'Conversations with AI',
      iconColor: 'text-brand-orange',
      bgColor: 'bg-orange-50',
    },
    {
      icon: <CheckCircle className="size-5" />,
      label: 'Qualified Leads',
      value: (dashboardData?.qualifiedLeads || 0).toLocaleString(),
      sublabel: 'AI qualification',
      iconColor: 'text-success',
      bgColor: 'bg-success-bg',
    },
    {
      icon: <TrendingUp className="size-5" />,
      label: 'Conversion Rate',
      value: dashboardData?.conversionRate 
        ? `${Number(dashboardData.conversionRate).toFixed(1)}%`
        : '0%',
      sublabel: 'Lead to qualified',
      iconColor: 'text-brand-orange',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-xl bg-white p-4 border border-gray-200 hover:shadow-md transition-all"
        >

          {/* Content */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                metric.bgColor,
                metric.iconColor
              )}>
                {metric.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </p>
            <p className="text-xs font-medium text-gray-700">
              {metric.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {metric.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

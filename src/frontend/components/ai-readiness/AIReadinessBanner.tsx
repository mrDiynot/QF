'use client';

/**
 * AI Readiness Banner Component
 * Compact banner for dashboard and key pages showing AI readiness status
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  X,
  Calendar,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIReadinessChecklist } from '@/types/ai-readiness';

interface AIReadinessBannerProps {
  data: AIReadinessChecklist;
  onDismiss?: () => void;
  variant?: 'default' | 'compact' | 'inline';
  /** Whether the onboarding call has been scheduled */
  onboardingCallScheduled?: boolean;
  /** When the onboarding call is scheduled for */
  onboardingCallScheduledAt?: string;
}

export function AIReadinessBanner({
  data,
  onDismiss,
  variant = 'default',
  onboardingCallScheduled = false,
  onboardingCallScheduledAt,
}: AIReadinessBannerProps) {
  const score = data.score.overallScore;
  const isReady = data.score.isFullyReady;
  const nextAction = data.score.nextActions[0];

  if (isReady && variant !== 'inline') {
    return null; // Don't show banner if fully ready (except inline variant)
  }

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg',
        isReady 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      )}>
        <div className={cn(
          'p-1.5 rounded-full',
          isReady ? 'bg-green-100' : 'bg-amber-100'
        )}>
          {isReady ? (
            <CheckCircle2 className="size-4 text-green-600" />
          ) : (
            <Sparkles className="size-4 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <span className={cn(
            'text-sm font-medium',
            isReady ? 'text-green-800' : 'text-amber-800'
          )}>
            AI Readiness: {score}%
          </span>
          {!isReady && nextAction && (
            <span className="text-xs text-amber-600 ml-2">
              Next: {nextAction.title}
            </span>
          )}
        </div>
        {!isReady && (
          <Link href="/dashboard/ai-readiness">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
              View Checklist
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-3 bg-white border border-amber-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-warning" />
          <div>
            <span className="text-sm font-medium text-gray-900">
              AI Setup {score}% Complete
            </span>
            <Progress value={score} className="h-1.5 w-20 mt-1" />
          </div>
        </div>
        {nextAction && (
          <Link href={nextAction.actionUrl || '/dashboard/ai-readiness'} className="flex-1">
            <Button size="sm" variant="outline" className="w-full gap-1 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
              {nextAction.title}
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        )}
        {onDismiss && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="size-6 text-amber-600 hover:text-amber-800"
            onClick={onDismiss}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  // Default full banner - Neutral with brand accent
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-100 rounded-xl p-6">
      {/* Brand accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-pink-500" />
      
      <div className="relative flex items-center gap-6">
        {/* Score ring */}
        <div className="flex-shrink-0">
          <div className="relative size-20">
            <svg className="transform -rotate-90" width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="34"
                strokeWidth="6"
                fill="none"
                className="stroke-gray-200"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className="stroke-brand-orange transition-all duration-500"
                style={{
                  strokeDasharray: 2 * Math.PI * 34,
                  strokeDashoffset: 2 * Math.PI * 34 * (1 - score / 100),
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{score}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-5 text-brand-orange" />
            <h3 className="text-lg font-semibold text-gray-900">Unlock Full AI Power</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Complete your setup to enable AI-driven lead qualification, auto-responses, and intelligent routing.
          </p>
          
          {/* Next actions preview */}
          {data.score.nextActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.score.nextActions.slice(0, 3).map(action => (
                <Badge 
                  key={action.id} 
                  variant="secondary" 
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer border border-gray-200"
                >
                  {action.importance === 'critical' && (
                    <AlertTriangle className="size-3 mr-1" />
                  )}
                  {action.title}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 flex flex-col gap-2">
          <Link href="/dashboard/ai-readiness">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 gap-2 shadow-lg shadow-orange-500/20">
              Complete Setup
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          {onboardingCallScheduled ? (
            <Link href="/dashboard/onboarding-call">
              <Button
                variant="ghost"
                size="sm"
                className="text-success hover:text-success hover:bg-success-bg gap-2 w-full"
              >
                <CalendarCheck className="size-4" />
                {onboardingCallScheduledAt
                  ? `Call: ${new Date(onboardingCallScheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : 'Call Scheduled ✓'}
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/onboarding-call">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 gap-2 w-full"
              >
                <Calendar className="size-4" />
                Book Onboarding Call
              </Button>
            </Link>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={onDismiss}
            >
              Remind me later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIReadinessBanner;

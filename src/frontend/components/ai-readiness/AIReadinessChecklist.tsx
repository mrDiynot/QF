'use client';

/**
 * AI Readiness Checklist Component
 * Displays business readiness for AI-driven capabilities
 */

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  Target,
  MessageSquare,
  Brain,
  Users,
  CreditCard,
  BookOpen,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  AIReadinessChecklist as AIReadinessChecklistType, 
  ChecklistItem, 
  ChecklistCategoryData,
  ChecklistCategoryId 
} from '@/types/ai-readiness';

interface AIReadinessChecklistProps {
  data: AIReadinessChecklistType;
  compact?: boolean;
  showNextActions?: boolean;
  onRefresh?: () => void;
  /** Show special "Complete Your Setup" section for new users */
  highlightDeferredSetup?: boolean;
}

const categoryIcons: Record<ChecklistCategoryId, React.ReactNode> = {
  onboarding: <Target className="size-5" />,
  channels: <MessageSquare className="size-5" />,
  ai_config: <Brain className="size-5" />,
  knowledge: <BookOpen className="size-5" />,
  leads: <Users className="size-5" />,
  subscription: <CreditCard className="size-5" />,
};

// All categories use neutral colors - no semantic meaning
const categoryColors: Record<ChecklistCategoryId, string> = {
  onboarding: 'text-muted-foreground bg-muted/50',
  channels: 'text-muted-foreground bg-muted/50',
  ai_config: 'text-muted-foreground bg-muted/50',
  knowledge: 'text-muted-foreground bg-muted/50',
  leads: 'text-muted-foreground bg-muted/50',
  subscription: 'text-muted-foreground bg-muted/50',
};

function StatusIcon({ status }: { status: ChecklistItem['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="size-5 text-success" />;
    case 'in_progress':
      return <Loader2 className="size-5 text-info animate-spin" />;
    case 'blocked':
      return <AlertCircle className="size-5 text-error" />;
    default:
      return <Circle className="size-5 text-muted-foreground/30" />;
  }
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          fill="none"
          className="stroke-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className={cn('transition-all duration-500', getColor().replace('text-', 'stroke-'))}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', getColor())}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg transition-colors',
      item.status === 'completed' ? 'bg-green-50/50' :
      item.status === 'blocked' ? 'bg-red-50/50' :
      'hover:bg-muted/20'
    )}>
      <StatusIcon status={item.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-medium text-sm',
            item.status === 'completed' ? 'text-green-800' :
            item.status === 'blocked' ? 'text-red-800' :
            'text-foreground'
          )}>
            {item.title}
          </span>
          {item.importance === 'critical' && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              Critical
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        {item.blockedReason && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="size-3" />
            {item.blockedReason}
          </p>
        )}
      </div>
      {item.status !== 'completed' && item.actionUrl && (
        <Link href={item.actionUrl}>
          <Button size="sm" variant="outline" className="gap-1 text-xs h-7">
            {item.actionLabel || 'Fix'}
            <ChevronRight className="size-3" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function CategoryProgress({ category }: { category: ChecklistCategoryData }) {
  const percentage = Math.round((category.completedCount / category.totalCount) * 100);
  
  return (
    <AccordionItem value={category.id} className="border rounded-lg px-4 mb-2">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn('p-2 rounded-lg', categoryColors[category.id])}>
            {categoryIcons[category.id]}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              {category.isComplete && (
                <CheckCircle2 className="size-4 text-green-600" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={percentage} className="h-1.5 w-24" />
              <span className="text-xs text-muted-foreground">
                {category.completedCount}/{category.totalCount}
              </span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">
        <div className="space-y-2">
          {category.items.map(item => (
            <ChecklistItemRow key={item.id} item={item} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function AIReadinessChecklist({ 
  data, 
  compact = false, 
  showNextActions = true,
  onRefresh,
  highlightDeferredSetup = false,
}: AIReadinessChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Items deferred from 3-step onboarding (new users should complete these)
  const deferredSetupItems = highlightDeferredSetup 
    ? data.categories
        .flatMap(cat => cat.items)
        .filter(item => 
          ['team_size_set', 'lead_type_configured', 'crm_integrated', 'lead_sources_configured', 
           'business_hours_set', 'calendar_connected'].includes(item.id)
        )
        .filter(item => item.status !== 'completed')
    : [];

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5" />
              <CardTitle className="text-lg">AI Readiness</CardTitle>
            </div>
            <Badge variant="secondary" className={cn(
              'text-xs',
              data.score.isFullyReady 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            )}>
              {data.score.isFullyReady ? 'Ready' : 'Setup Needed'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="-mt-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <ScoreRing score={data.score.overallScore} size={80} />
              <div className="flex-1 ml-4">
                {data.score.nextActions.slice(0, 2).map(action => (
                  <Link key={action.id} href={action.actionUrl || '#'}>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/20 transition-colors">
                      <Zap className="size-4 text-yellow-500" />
                      <span className="text-sm text-foreground/80 flex-1">{action.title}</span>
                      <ArrowRight className="size-4 text-muted-foreground/60" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <Sparkles className="size-6" />
            </div>
            <div>
              <CardTitle>AI Readiness Checklist</CardTitle>
              <CardDescription>
                Complete these steps to unlock 100% AI-driven qualification power
              </CardDescription>
            </div>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="flex items-center gap-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
          <ScoreRing score={data.score.overallScore} />
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">
                {data.score.isFullyReady 
                  ? '🎉 Your AI is Ready!' 
                  : 'Almost There!'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {data.score.isFullyReady 
                  ? 'All critical items complete. Your AI can now qualify leads at full power.'
                  : `Complete ${data.score.blockedItems.length + data.score.nextActions.length} more items to unlock full AI capabilities.`}
              </p>
            </div>
            {/* Category mini scores */}
            <div className="grid grid-cols-3 gap-2">
              {data.categories.slice(0, 6).map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div className={cn('p-1 rounded', categoryColors[cat.id])}>
                    {categoryIcons[cat.id]}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">{Math.round((cat.completedCount / cat.totalCount) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deferred Setup (for new users who completed 3-step onboarding) */}
        {highlightDeferredSetup && deferredSetupItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-brand-orange" />
                Complete Your Setup
              </h4>
              <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                Quick Wins
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              You&apos;ve completed the essential 3 steps! Now add these details to unlock full AI power.
            </p>
            <div className="space-y-2">
              {deferredSetupItems.map(item => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Next Actions */}
        {showNextActions && data.score.nextActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Zap className="size-4 text-yellow-500" />
              Priority Actions
            </h4>
            <div className="space-y-2">
              {data.score.nextActions.map(action => (
                <ChecklistItemRow key={action.id} item={action} />
              ))}
            </div>
          </div>
        )}

        {/* Blocked Items Warning */}
        {data.score.blockedItems.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 flex items-center gap-2 mb-2">
              <AlertCircle className="size-4" />
              Action Required
            </h4>
            <div className="space-y-2">
              {data.score.blockedItems.map(item => (
                <ChecklistItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Detailed Checklist</h4>
          <Accordion 
            type="multiple" 
            value={expandedCategories}
            onValueChange={setExpandedCategories}
          >
            {data.categories.map(category => (
              <CategoryProgress key={category.id} category={category} />
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIReadinessChecklist;

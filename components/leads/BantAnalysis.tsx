'use client';

import { useBantExtraction, getScoreColor, getScoreBgColor, calculateOverallBantScore } from '@/hooks/useLeadScoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, DollarSign, Shield, Target, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BantAnalysisProps {
  conversationId: string;
  className?: string;
}

const bantIcons = {
  budget: DollarSign,
  authority: Shield,
  need: Target,
  timeline: Clock,
};

const bantDescriptions = {
  budget: 'Financial capacity to purchase',
  authority: 'Decision-making power',
  need: 'Business need or pain point',
  timeline: 'Urgency and timeline to act',
};

export function BantAnalysis({ conversationId, className }: BantAnalysisProps) {
  const { data: bant, isLoading, error } = useBantExtraction(conversationId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            BANT Analysis
          </CardTitle>
          <CardDescription>AI-powered qualification signals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !bant) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            BANT Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Unable to analyze conversation</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallScore = calculateOverallBantScore(bant);
  const bantItems = [
    { key: 'budget' as const, score: bant.budgetScore, signals: bant.budgetSignals },
    { key: 'authority' as const, score: bant.authorityScore, signals: bant.authoritySignals },
    { key: 'need' as const, score: bant.needScore, signals: bant.needSignals },
    { key: 'timeline' as const, score: bant.timelineScore, signals: bant.timelineSignals },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              BANT Analysis
            </CardTitle>
            <CardDescription>AI-powered qualification signals</CardDescription>
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', getScoreColor(overallScore))}>
              {overallScore}
            </div>
            <div className="text-xs text-muted-foreground">Overall Score</div>
          </div>
        </div>
        {bant.confidence < 0.7 && (
          <Badge variant="outline" className="w-fit mt-2">
            Confidence: {Math.round(bant.confidence * 100)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {bantItems.map(({ key, score, signals }) => {
          const Icon = bantIcons[key];
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1.5 rounded', getScoreBgColor(score))}>
                    <Icon className={cn('h-4 w-4', getScoreColor(score))} />
                  </div>
                  <div>
                    <div className="font-medium capitalize">{key}</div>
                    <div className="text-xs text-muted-foreground">
                      {bantDescriptions[key]}
                    </div>
                  </div>
                </div>
                <span className={cn('text-lg font-semibold', getScoreColor(score))}>
                  {score}
                </span>
              </div>
              <Progress value={score} className="h-2" />
              {signals.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {signals.slice(0, 3).map((signal, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {signal}
                    </Badge>
                  ))}
                  {signals.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{signals.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {bant.reasoning && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-1">AI Reasoning</div>
            <p className="text-sm text-muted-foreground">{bant.reasoning}</p>
          </div>
        )}

        {bant.supportingQuotes && bant.supportingQuotes.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Key Quotes</div>
            <div className="space-y-2">
              {bant.supportingQuotes.slice(0, 2).map((quote, idx) => (
                <blockquote
                  key={idx}
                  className="border-l-2 border-muted-foreground/20 pl-3 text-sm italic text-muted-foreground"
                >
                  &quot;{quote}&quot;
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BantAnalysis;

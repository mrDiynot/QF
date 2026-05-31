'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelRecommendation } from '@/services/api/ai-channel-recommender.service';

interface ChannelRecommendationCardProps {
  recommendation: ChannelRecommendation;
  onActivate?: () => void;
  isActivating?: boolean;
}

const DIFFICULTY_COLORS = {
  Easy: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Hard: 'bg-error/10 text-error border-error/20',
};

const CONFIDENCE_COLORS = {
  high: 'text-success',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}

export function ChannelRecommendationCard({
  recommendation,
  onActivate,
  isActivating = false,
}: ChannelRecommendationCardProps) {
  const confidenceLevel = getConfidenceLevel(recommendation.confidenceScore);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/20">
      {/* Priority Badge */}
      {recommendation.priority === 1 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="gradient-brand text-white border-0">
            ⭐ Top Pick
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-text-navy">
                {recommendation.displayName}
              </h3>
              <Badge
                variant="outline"
                className={DIFFICULTY_COLORS[recommendation.setupDifficulty]}
              >
                {recommendation.setupDifficulty} Setup
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              {recommendation.description}
            </p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">AI Confidence</span>
            <span className={cn('font-semibold', CONFIDENCE_COLORS[confidenceLevel])}>
              {recommendation.confidenceScore}%
            </span>
          </div>
          <Progress value={recommendation.confidenceScore} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expected Impact Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-xs text-success mb-1">
              <TrendingUp className="size-3" />
              <span>Conversion</span>
            </div>
            <div className="text-lg font-bold text-success">
              {recommendation.expectedImpact.conversionIncrease}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <DollarSign className="size-3" />
              <span>Revenue</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {recommendation.expectedImpact.revenueIncrease}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="size-3" />
              <span>Time to Value</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {recommendation.expectedImpact.timeToValue}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Users className="size-3" />
              <span>Lead Volume</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {recommendation.expectedImpact.leadVolumeIncrease}
            </div>
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="p-3 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Sparkles className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-foreground mb-1">
                Why this channel?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        {recommendation.useCases.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-navy">
              Perfect for:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {recommendation.useCases.map((useCase, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                  <CheckCircle2 className="size-3 text-success mt-0.5 flex-shrink-0" />
                  <span>{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro Tips */}
        {recommendation.proTips.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-text-navy">
              <Lightbulb className="size-3 text-warning" />
              <span>Pro Tips</span>
            </div>
            <div className="space-y-1">
              {recommendation.proTips.slice(0, 2).map((tip, i) => (
                <div key={i} className="text-xs text-text-secondary pl-4">
                  • {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost and CTA */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-sm">
            <span className="text-text-secondary">Est. cost: </span>
            <span className="font-semibold text-text-navy">
              ${recommendation.estimatedMonthlyCost}/month
            </span>
          </div>
          <Button
            onClick={onActivate}
            disabled={isActivating}
            variant="gradient"
          >
            {isActivating ? (
              <>Setting up...</>
            ) : (
              <>
                Activate Now
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for multiple recommendations
export function ChannelRecommendationsGrid({
  recommendations,
  onActivate,
  isActivating,
}: {
  recommendations: ChannelRecommendation[];
  onActivate?: (recommendation: ChannelRecommendation) => void;
  isActivating?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {recommendations.map((recommendation) => (
        <ChannelRecommendationCard
          key={recommendation.channelType}
          recommendation={recommendation}
          onActivate={() => onActivate?.(recommendation)}
          isActivating={isActivating}
        />
      ))}
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelMastery } from '@/services/api/gamification.service';

interface ChannelMasteryCardProps {
  mastery: ChannelMastery;
  compact?: boolean;
}

// Mastery levels use neutral progression with brand accent for master level
const MASTERY_COLORS = {
  1: { bg: 'bg-muted/30', text: 'text-muted-foreground', border: 'border-border' },
  2: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border' },
  3: { bg: 'bg-muted/70', text: 'text-foreground', border: 'border-border' },
  4: { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' },
  5: { bg: 'gradient-brand', text: 'text-white', border: 'border-primary' },
};

export function ChannelMasteryCard({ mastery, compact = false }: ChannelMasteryCardProps) {
  const colors = MASTERY_COLORS[mastery.masteryLevel as keyof typeof MASTERY_COLORS];
  const stars = Array.from({ length: 5 }, (_, i) => i < mastery.masteryLevel);

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', colors.bg)}>
                <Award className={cn('size-5', colors.text)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-navy">
                    {mastery.channelType}
                  </span>
                  <Badge variant="outline" className={cn('text-xs', colors.border)}>
                    {mastery.masteryLevelName}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {stars.map((filled, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-3',
                        filled ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-text-navy">
                {mastery.levelProgress}%
              </div>
              <div className="text-xs text-text-secondary">
                to Level {mastery.masteryLevel + 1}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn('pb-3', colors.bg)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className={cn('size-5', colors.text)} />
            <span className={colors.text}>{mastery.channelType} Mastery</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'text-sm font-semibold',
              mastery.masteryLevel === 5 ? 'bg-white/20 border-white/40 text-white' : colors.border
            )}
          >
            {mastery.masteryLevelName}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {stars.map((filled, i) => (
            <Star
              key={i}
              className={cn(
                'size-4',
                filled
                  ? mastery.masteryLevel === 5
                    ? 'fill-white text-white'
                    : 'fill-warning text-warning'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Progress to Next Level */}
        {mastery.masteryLevel < 5 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Progress to {mastery.masteryLevelName === 'Grandmaster' ? 'Grandmaster' : `Level ${mastery.masteryLevel + 1}`}</span>
              <span className="font-semibold text-text-navy">{mastery.levelProgress}%</span>
            </div>
            <Progress value={mastery.levelProgress} className="h-3" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <TrendingUp className="size-3" />
              <span>Messages</span>
            </div>
            <div className="text-lg font-bold text-text-navy">
              {mastery.totalMessages.toLocaleString()}
            </div>
            {mastery.masteryLevel < 5 && (
              <div className="text-xs text-text-muted">
                / {mastery.nextLevelRequirements.messages.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Target className="size-3" />
              <span>Conversions</span>
            </div>
            <div className="text-lg font-bold text-text-navy">
              {mastery.totalConversions}
            </div>
            {mastery.masteryLevel < 5 && (
              <div className="text-xs text-text-muted">
                / {mastery.nextLevelRequirements.conversions}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Star className="size-3" />
              <span>Response Rate</span>
            </div>
            <div className="text-lg font-bold text-text-navy">
              {(mastery.averageResponseRate * 100).toFixed(0)}%
            </div>
            {mastery.masteryLevel < 5 && (
              <div className="text-xs text-text-muted">
                / {(mastery.nextLevelRequirements.responseRate * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {/* Unlocks */}
        {mastery.unlocks.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-text-navy">
              Unlocked Features
            </div>
            <div className="flex flex-wrap gap-2">
              {mastery.unlocks.map((unlock, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  ✨ {unlock}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Experience Points */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">Experience Points</span>
          <span className="text-lg font-bold text-primary">
            {mastery.experiencePoints.toLocaleString()} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

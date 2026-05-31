'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Achievement, BusinessAchievement } from '@/services/api/gamification.service';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: BusinessAchievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Achievement tiers use warning color progression with brand for top tier
const TIER_COLORS = {
  bronze: 'from-warning/60 to-warning/80',
  silver: 'from-muted-foreground/40 to-muted-foreground/60',
  gold: 'from-warning to-warning/90',
  platinum: 'from-muted to-muted-foreground',
  diamond: 'gradient-brand',
};

const TIER_BORDERS = {
  bronze: 'border-warning/60',
  silver: 'border-muted-foreground/40',
  gold: 'border-warning',
  platinum: 'border-muted-foreground',
  diamond: 'border-primary',
};

const SIZE_CLASSES = {
  sm: {
    card: 'p-3',
    icon: 'text-3xl',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    card: 'p-4',
    icon: 'text-4xl',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    card: 'p-6',
    icon: 'text-5xl',
    title: 'text-lg',
    description: 'text-base',
  },
};

export function AchievementBadge({
  achievement,
  earned,
  showProgress = false,
  size = 'md',
}: AchievementBadgeProps) {
  const isEarned = !!earned;
  const progress = earned?.progress || 0;
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg',
        sizeClasses.card,
        isEarned ? 'border-2' : 'opacity-60',
        isEarned && TIER_BORDERS[achievement.tier]
      )}
    >
      {/* Tier gradient background */}
      {isEarned && (
        <div
          className={cn(
            'absolute inset-0 opacity-5 bg-gradient-to-br',
            TIER_COLORS[achievement.tier]
          )}
        />
      )}

      <div className="relative space-y-3">
        {/* Icon and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex items-center justify-center rounded-full',
                sizeClasses.icon,
                isEarned ? 'animate-bounce-once' : 'grayscale'
              )}
            >
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn('font-bold text-text-navy', sizeClasses.title)}>
                  {achievement.title}
                </h3>
                {isEarned && (
                  <CheckCircle2 className="size-4 text-success" />
                )}
                {!isEarned && (
                  <Lock className="size-4 text-muted-foreground/40" />
                )}
              </div>
              <p className={cn('text-text-secondary', sizeClasses.description)}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Tier Badge */}
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              isEarned && `bg-gradient-to-r ${TIER_COLORS[achievement.tier]} text-white border-0`
            )}
          >
            {achievement.tier}
          </Badge>
        </div>

        {/* Progress Bar (if not earned and showProgress) */}
        {!isEarned && showProgress && progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Points and Reward */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-600">
            <Trophy className="size-3" />
            <span className="font-semibold">{achievement.points} points</span>
          </div>
          {achievement.rewardDescription && (
            <span className="text-text-secondary">
              🎁 {achievement.rewardDescription}
            </span>
          )}
        </div>

        {/* Earned Date */}
        {earned?.earnedAt && (
          <div className="text-xs text-text-muted">
            Earned {new Date(earned.earnedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}

// Grid layout for multiple badges
export function AchievementGrid({
  achievements,
  earnedAchievements,
  showProgress = false,
}: {
  achievements: Achievement[];
  earnedAchievements: BusinessAchievement[];
  showProgress?: boolean;
}) {
  const earnedMap = new Map(
    earnedAchievements.map(ea => [ea.achievementId, ea])
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map(achievement => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          earned={earnedMap.get(achievement.id)}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
}

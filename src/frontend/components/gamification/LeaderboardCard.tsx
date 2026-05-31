'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Leaderboard, LeaderboardEntry } from '@/services/api/gamification.service';

interface LeaderboardCardProps {
  leaderboard: Leaderboard;
  showFullList?: boolean;
}

// Top 3 ranks use warning color for distinction
const RANK_ICONS = {
  1: { icon: Trophy, color: 'text-warning', bg: 'bg-warning/10' },
  2: { icon: Medal, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  3: { icon: Award, color: 'text-warning/70', bg: 'bg-warning/5' },
};

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="size-4 text-success" />;
    case 'down':
      return <TrendingDown className="size-4 text-error" />;
    default:
      return <Minus className="size-4 text-muted-foreground" />;
  }
}

function getMetricLabel(metricType: string): string {
  switch (metricType) {
    case 'response_time':
      return 'Fastest Response Time';
    case 'conversion_rate':
      return 'Highest Conversion Rate';
    case 'satisfaction':
      return 'Customer Satisfaction';
    default:
      return metricType;
  }
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case 'daily':
      return 'Today';
    case 'weekly':
      return 'This Week';
    case 'monthly':
      return 'This Month';
    case 'all_time':
      return 'All Time';
    default:
      return period;
  }
}

function formatScore(score: number, metricType: string): string {
  switch (metricType) {
    case 'response_time':
      return score < 60 ? `${score}s` : `${Math.floor(score / 60)}m ${score % 60}s`;
    case 'conversion_rate':
      return `${score.toFixed(1)}%`;
    case 'satisfaction':
      return `${score.toFixed(1)}/10`;
    default:
      return score.toString();
  }
}

function LeaderboardRow({ entry, metricType, isCurrentUser }: {
  entry: LeaderboardEntry;
  metricType: string;
  isCurrentUser: boolean;
}) {
  const rankConfig = RANK_ICONS[entry.rank as keyof typeof RANK_ICONS];
  const RankIcon = rankConfig?.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg transition-colors',
        isCurrentUser ? 'bg-primary/5 border-2 border-primary/20' : 'hover:bg-muted/30'
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Rank */}
        <div className={cn('flex items-center justify-center w-10 h-10 rounded-full', rankConfig?.bg || 'bg-muted/50')}>
          {RankIcon ? (
            <RankIcon className={cn('size-5', rankConfig.color)} />
          ) : (
            <span className="font-bold text-foreground">{entry.rank}</span>
          )}
        </div>

        {/* Business Info */}
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {entry.businessName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold', isCurrentUser && 'text-primary')}>
                {entry.businessName}
              </span>
              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs">You</Badge>
              )}
              {entry.badge && (
                <span className="text-lg">{entry.badge}</span>
              )}
            </div>
            {entry.previousRank && (
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                {getTrendIcon(entry.trend)}
                <span>
                  {entry.trend === 'up' && `+${entry.previousRank - entry.rank}`}
                  {entry.trend === 'down' && `-${entry.rank - entry.previousRank}`}
                  {entry.trend === 'stable' && 'No change'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="text-lg font-bold text-text-navy">
            {formatScore(entry.score, metricType)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardCard({ leaderboard, showFullList = false }: LeaderboardCardProps) {
  const displayEntries = showFullList ? leaderboard.entries : leaderboard.entries.slice(0, 5);
  const userRank = leaderboard.userEntry?.rank;
  const userInTop5 = userRank && userRank <= 5;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <span>{leaderboard.industry} - {getMetricLabel(leaderboard.metricType)}</span>
          </CardTitle>
          <Badge variant="outline">{getPeriodLabel(leaderboard.period)}</Badge>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          {leaderboard.totalParticipants} businesses competing
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        {displayEntries.map(entry => (
          <LeaderboardRow
            key={entry.businessId}
            entry={entry}
            metricType={leaderboard.metricType}
            isCurrentUser={entry.businessId === 'current'}
          />
        ))}

        {/* Show user's rank if not in top 5 */}
        {!userInTop5 && leaderboard.userEntry && (
          <>
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-text-muted">...</div>
            </div>
            <LeaderboardRow
              entry={leaderboard.userEntry}
              metricType={leaderboard.metricType}
              isCurrentUser={true}
            />
          </>
        )}

        {/* Motivational message */}
        {leaderboard.userEntry && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-foreground">
              {userRank === 1 && "🎉 You're #1! Amazing work!"}
              {userRank === 2 && "🥈 So close to #1! Keep pushing!"}
              {userRank === 3 && "🥉 Great job! You're in the top 3!"}
              {userRank && userRank > 3 && userRank <= 10 && `💪 You're in the top ${Math.ceil((userRank / leaderboard.totalParticipants) * 100)}%! Keep it up!`}
              {userRank && userRank > 10 && `🎯 Keep improving! You're ${leaderboard.entries[0].score - leaderboard.userEntry.score} away from #1.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

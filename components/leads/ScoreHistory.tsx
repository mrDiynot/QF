'use client';

import { useScoreHistory, useRecalculateScore, getScoreColor } from '@/hooks/useLeadScoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface ScoreHistoryProps {
  leadId: string;
  className?: string;
  limit?: number;
  showRecalculate?: boolean;
}

export function ScoreHistory({ 
  leadId, 
  className, 
  limit = 10,
  showRecalculate = true 
}: ScoreHistoryProps) {
  const { data: history, isLoading, error, refetch } = useScoreHistory(leadId, limit);
  const recalculateMutation = useRecalculateScore();

  const handleRecalculate = () => {
    recalculateMutation.mutate(leadId);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load score history</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeText = (change: number) => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Score History
            </CardTitle>
            <CardDescription>
              Track qualification score changes over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            {showRecalculate && (
              <Button
                size="sm"
                onClick={handleRecalculate}
                disabled={recalculateMutation.isPending}
              >
                {recalculateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                Recalculate
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!history || history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No score history available</p>
            <p className="text-sm">Score changes will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-start gap-3 pb-4',
                    index < history.length - 1 && 'border-b'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm',
                      getScoreColor(entry.score).replace('text-', 'bg-').replace('600', '100'),
                      getScoreColor(entry.score)
                    )}
                  >
                    {entry.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(entry.scoreChange)}
                      <span
                        className={cn(
                          'font-medium',
                          entry.scoreChange > 0 && 'text-green-600',
                          entry.scoreChange < 0 && 'text-red-600'
                        )}
                      >
                        {getChangeText(entry.scoreChange)} points
                      </span>
                      {entry.previousScore !== null && (
                        <span className="text-muted-foreground text-sm">
                          from {entry.previousScore}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.source}
                      </Badge>
                      {entry.reason && (
                        <span className="text-xs text-muted-foreground truncate">
                          {entry.reason}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span title={format(new Date(entry.scoredAt), 'PPpp')}>
                        {formatDistanceToNow(new Date(entry.scoredAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default ScoreHistory;

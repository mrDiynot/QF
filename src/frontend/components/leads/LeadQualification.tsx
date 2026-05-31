'use client';

/**
 * Lead Qualification UI Component
 * Shows BANT scoring criteria with visual indicators and AI re-qualification
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  DollarSign,
  UserCheck,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

interface BANTScore {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
}

interface LeadQualificationProps {
  leadId: string;
  currentScore: number;
  bantScores?: BANTScore;
  className?: string;
  onScoreUpdate?: (newScore: number) => void;
}

const BANT_CRITERIA = [
  {
    key: 'budget' as const,
    label: 'Budget',
    icon: DollarSign,
    description: 'Does the lead have budget allocated for this purchase?',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    key: 'authority' as const,
    label: 'Authority',
    icon: UserCheck,
    description: 'Is the lead a decision-maker or influencer?',
    color: 'text-info',
    bgColor: 'bg-muted/50',
  },
  {
    key: 'need' as const,
    label: 'Need',
    icon: Target,
    description: 'Does the lead have a clear need for the solution?',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'timeline' as const,
    label: 'Timeline',
    icon: Clock,
    description: 'Is there urgency or a defined timeline?',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const getScoreLabel = (score: number): { label: string; color: string; icon: React.ReactNode } => {
  if (score >= 80) return { label: 'Hot Lead', color: 'text-green-600', icon: <TrendingUp className="size-4" /> };
  if (score >= 60) return { label: 'Warm Lead', color: 'text-info', icon: <CheckCircle className="size-4" /> };
  if (score >= 40) return { label: 'Cool Lead', color: 'text-amber-600', icon: <AlertTriangle className="size-4" /> };
  return { label: 'Cold Lead', color: 'text-red-600', icon: <AlertTriangle className="size-4" /> };
};

const getProgressColor = (score: number): string => {
  if (score >= 80) return '[&>div]:bg-green-500';
  if (score >= 60) return '[&>div]:bg-muted/300';
  if (score >= 40) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-500';
};

export function LeadQualification({
  leadId,
  currentScore,
  bantScores,
  className,
  onScoreUpdate,
}: LeadQualificationProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [localScores, setLocalScores] = useState<BANTScore>(
    bantScores || { budget: 25, authority: 25, need: 25, timeline: 25 }
  );

  // AI Re-qualification mutation
  const requalifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/leads/${leadId}/qualify`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Lead re-qualified with AI');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      if (data.score && onScoreUpdate) {
        onScoreUpdate(data.score);
      }
    },
    onError: () => {
      toast.error('Failed to re-qualify lead');
    },
  });

  // Manual score update mutation
  const updateScoresMutation = useMutation({
    mutationFn: async (scores: BANTScore) => {
      const response = await apiClient.patch(`/leads/${leadId}`, {
        bantScores: scores,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Scores updated');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
    onError: () => {
      toast.error('Failed to update scores');
    },
  });

  const handleScoreChange = (key: keyof BANTScore, value: number[]) => {
    setLocalScores((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleSaveScores = () => {
    updateScoresMutation.mutate(localScores);
  };

  // Total score calculated for display
  void Math.round(
    (localScores.budget + localScores.authority + localScores.need + localScores.timeline) / 4
  );
  const scoreInfo = getScoreLabel(currentScore);

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Lead Qualification</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground/60">
                <Info className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                BANT scoring evaluates leads based on Budget, Authority, Need, and Timeline.
                Higher scores indicate better qualification.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <div className={cn("text-5xl font-bold mb-2", scoreInfo.color)}>
          {currentScore}
        </div>
        <div className="flex items-center justify-center gap-2">
          {scoreInfo.icon}
          <span className={cn("text-sm font-medium", scoreInfo.color)}>
            {scoreInfo.label}
          </span>
        </div>
        <Progress
          value={currentScore}
          className={cn("h-2 mt-4", getProgressColor(currentScore))}
        />
      </div>

      {/* BANT Criteria */}
      <div className="space-y-4">
        {BANT_CRITERIA.map((criteria) => {
          const Icon = criteria.icon;
          const score = localScores[criteria.key];

          return (
            <div key={criteria.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("flex size-8 items-center justify-center rounded-lg", criteria.bgColor)}>
                    <Icon className={cn("size-4", criteria.color)} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{criteria.label}</span>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground">{criteria.description}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={cn("font-semibold", criteria.color)}>
                  {score}%
                </Badge>
              </div>

              {isEditing ? (
                <Slider
                  value={[score]}
                  onValueChange={(value) => handleScoreChange(criteria.key, value)}
                  max={100}
                  step={5}
                  className="py-2"
                />
              ) : (
                <Progress
                  value={score}
                  className={cn("h-1.5", getProgressColor(score))}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditing(false);
                setLocalScores(bantScores || { budget: 25, authority: 25, need: 25, timeline: 25 });
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveScores}
              disabled={updateScoresMutation.isPending}
            >
              {updateScoresMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Save Scores
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Target className="size-4" />
              Adjust Manually
            </Button>
            <Button
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => requalifyMutation.mutate()}
              disabled={requalifyMutation.isPending}
            >
              {requalifyMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Re-qualify with AI
            </Button>
          </>
        )}
      </div>

      {/* AI Insights */}
      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">AI Insight</p>
            <p className="text-xs text-primary">
              {currentScore >= 80
                ? "This lead shows strong buying signals. Recommend immediate follow-up with a tailored proposal."
                : currentScore >= 60
                ? "Good potential. Focus on addressing timeline and budget concerns to move forward."
                : currentScore >= 40
                ? "Needs nurturing. Share educational content and check back in 2-4 weeks."
                : "Low priority. Add to nurture campaign and monitor for engagement changes."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Compact version for sidebars
export function LeadScoreBadge({ score }: { score: number }) {
  const info = getScoreLabel(score);

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", 
      score >= 80 ? "bg-green-100" :
      score >= 60 ? "bg-muted/50" :
      score >= 40 ? "bg-amber-100" :
      "bg-red-100"
    )}>
      <span className={cn("text-lg font-bold", info.color)}>{score}</span>
      <span className={cn("text-xs font-medium", info.color)}>{info.label}</span>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  AlertCircle,
  Calendar,
  TrendingUp,
  Edit,
  Sparkles
} from 'lucide-react';

interface BANTScore {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
}

interface BANTScoringCardProps {
  scores: BANTScore;
  overallScore: number;
  lastUpdated?: Date;
  onEdit?: () => void;
  onAIQualify?: () => void;
}

export function BANTScoringCard({
  scores,
  overallScore,
  lastUpdated,
  onEdit,
  onAIQualify,
}: BANTScoringCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getQualificationLevel = (score: number) => {
    if (score >= 80) return { label: 'High Quality', variant: 'default' as const };
    if (score >= 60) return { label: 'Medium Quality', variant: 'secondary' as const };
    return { label: 'Low Quality', variant: 'destructive' as const };
  };

  const qualification = getQualificationLevel(overallScore);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">BANT Qualification</CardTitle>
            {lastUpdated && (
              <p className="text-xs text-text-secondary mt-1">
                Last updated {new Date(lastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onAIQualify && (
              <Button variant="outline" size="sm" onClick={onAIQualify}>
                <Sparkles className="size-4 mr-2" />
                AI Qualify
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
          <div>
            <p className="text-sm text-text-secondary mb-1">Overall Score</p>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <Badge variant={qualification.variant}>{qualification.label}</Badge>
            </div>
          </div>
          <div className={`p-4 rounded-full ${getScoreBgColor(overallScore)}`}>
            <TrendingUp className={`size-8 ${getScoreColor(overallScore)}`} />
          </div>
        </div>

        {/* Individual BANT Scores */}
        <div className="space-y-4">
          {/* Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Budget</p>
                  <p className="text-xs text-text-secondary">Financial capacity</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${getScoreColor(scores.budget)}`}>
                {scores.budget}
              </span>
            </div>
            <Progress value={scores.budget} className="h-2" />
          </div>

          {/* Authority */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Users className="size-4 text-info" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Authority</p>
                  <p className="text-xs text-text-secondary">Decision-making power</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${getScoreColor(scores.authority)}`}>
                {scores.authority}
              </span>
            </div>
            <Progress value={scores.authority} className="h-2" />
          </div>

          {/* Need */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Need</p>
                  <p className="text-xs text-text-secondary">Problem urgency</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${getScoreColor(scores.need)}`}>
                {scores.need}
              </span>
            </div>
            <Progress value={scores.need} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="size-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Timeline</p>
                  <p className="text-xs text-text-secondary">Purchase timeframe</p>
                </div>
              </div>
              <span className={`text-xl font-bold ${getScoreColor(scores.timeline)}`}>
                {scores.timeline}
              </span>
            </div>
            <Progress value={scores.timeline} className="h-2" />
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="bg-muted/20 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground/80">Scoring Guide</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">80-100: High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">60-79: Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">0-59: Low</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

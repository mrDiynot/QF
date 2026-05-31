'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { aiService } from '@/services/api/ai.service';
import { toast } from 'sonner';

interface AIQualificationPanelProps {
  leadId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  onQualificationComplete?: (result: QualificationResult) => void;
}

interface QualificationResult {
  leadId: string;
  qualificationScore: number;
  bant: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  recommendation: string;
  nextActions: string[];
  insights: {
    keyPhrases: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'high' | 'medium' | 'low';
    fitScore: number;
  };
}

export function AIQualificationPanel({
  leadId,
  conversationHistory = [],
  onQualificationComplete,
}: AIQualificationPanelProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [result, setResult] = useState<QualificationResult | null>(null);
  const queryClient = useQueryClient();

  const qualifyMutation = useMutation({
    mutationFn: async () => {
      const response = await aiService.qualifyLead({ leadId, forceRequalify: false });
      
      // Map API response to QualificationResult
      const bantScores = response.criterionScores.reduce((acc, criterion) => {
        const key = criterion.name.toLowerCase() as keyof QualificationResult['bant'];
        if (['budget', 'authority', 'need', 'timeline'].includes(key)) {
          acc[key] = criterion.score;
        }
        return acc;
      }, { budget: 0, authority: 0, need: 0, timeline: 0 });

      return {
        leadId: response.leadId,
        qualificationScore: response.score,
        bant: bantScores,
        recommendation: response.reasoning,
        nextActions: response.suggestedActions || [],
        insights: {
          keyPhrases: response.criterionScores.map(c => c.evidence || c.name).filter(Boolean),
          sentiment: response.score >= 70 ? 'positive' : response.score >= 40 ? 'neutral' : 'negative',
          urgency: response.score >= 80 ? 'high' : response.score >= 50 ? 'medium' : 'low',
          fitScore: response.confidence,
        },
      } as QualificationResult;
    },
    onSuccess: (data: QualificationResult) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead qualified successfully');
      onQualificationComplete?.(data);
    },
    onError: () => {
      toast.error('Failed to qualify lead');
    },
  });

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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle2 className="size-5 text-green-600" />;
      case 'negative':
        return <XCircle className="size-5 text-red-600" />;
      default:
        return <AlertCircle className="size-5 text-yellow-600" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const,
    };
    return <Badge variant={variants[urgency as keyof typeof variants]}>{urgency.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* AI Qualification Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Lead Qualification</CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                Powered by GPT-4 • Analyzes conversation and lead data
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversation Summary */}
          {conversationHistory.length > 0 && (
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="size-4 text-info" />
                <p className="text-sm font-semibold text-foreground">
                  {conversationHistory.length} conversation messages analyzed
                </p>
              </div>
              <p className="text-xs text-info">
                AI will analyze conversation context, sentiment, and buying signals
              </p>
            </div>
          )}

          {/* Additional Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Context (Optional)
            </label>
            <Textarea
              placeholder="Add any additional context about this lead (e.g., referral source, specific requirements, timeline constraints)..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              className="min-h-[100px]"
              disabled={qualifyMutation.isPending}
            />
          </div>

          {/* Qualify Button */}
          <Button
            onClick={() => qualifyMutation.mutate()}
            disabled={qualifyMutation.isPending}
            className="w-full"
            size="lg"
          >
            {qualifyMutation.isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Qualify Lead with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Qualification Results */}
      {result && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Qualification Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-5xl font-bold ${getScoreColor(result.qualificationScore)}`}>
                    {result.qualificationScore}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">Out of 100</p>
                </div>
                <div className={`p-4 rounded-full ${getScoreBgColor(result.qualificationScore)}`}>
                  <TrendingUp className={`size-8 ${getScoreColor(result.qualificationScore)}`} />
                </div>
              </div>
              <Progress value={result.qualificationScore} className="h-3" />
            </CardContent>
          </Card>

          {/* BANT Scores */}
          <Card>
            <CardHeader>
              <CardTitle>BANT Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-green-600" />
                    <span className="font-semibold">Budget</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(result.bant.budget)}`}>
                    {result.bant.budget}%
                  </span>
                </div>
                <Progress value={result.bant.budget} className="h-2" />
              </div>

              {/* Authority */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-info" />
                    <span className="font-semibold">Authority</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(result.bant.authority)}`}>
                    {result.bant.authority}%
                  </span>
                </div>
                <Progress value={result.bant.authority} className="h-2" />
              </div>

              {/* Need */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-primary" />
                    <span className="font-semibold">Need</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(result.bant.need)}`}>
                    {result.bant.need}%
                  </span>
                </div>
                <Progress value={result.bant.need} className="h-2" />
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-orange-600" />
                    <span className="font-semibold">Timeline</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(result.bant.timeline)}`}>
                    {result.bant.timeline}%
                  </span>
                </div>
                <Progress value={result.bant.timeline} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Sentiment</p>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(result.insights.sentiment)}
                    <span className="font-semibold capitalize">{result.insights.sentiment}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Urgency</p>
                  {getUrgencyBadge(result.insights.urgency)}
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Fit Score</p>
                  <span className={`text-2xl font-bold ${getScoreColor(result.insights.fitScore)}`}>
                    {result.insights.fitScore}%
                  </span>
                </div>
              </div>

              {result.insights.keyPhrases.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Key Phrases Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {result.insights.keyPhrases.map((phrase, idx) => (
                      <Badge key={idx} variant="secondary">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">{result.recommendation}</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Suggested Next Actions</p>
                <div className="space-y-2">
                  {result.nextActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Settings,
  Users,
  Zap,
  BarChart3,
  DollarSign,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useLeads } from '@/hooks/api';
import { leadScoringService } from '@/services/api/lead-scoring.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';

export default function LeadScoringPage() {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Subscription enforcement - Lead Scoring is available on all plans but advanced features require upgrade
  const { hasFeatureAccess: _hasFeatureAccess } = useFeatureAccess();

  // Fetch leads
  const { data: leadsData, isLoading: leadsLoading } = useLeads({ pageSize: 100 });

  // Fetch scoring configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['lead-scoring', 'configuration'],
    queryFn: () => leadScoringService.getConfiguration(),
  });

  // Fetch score history for selected lead
  const { data: scoreHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['lead-scoring', 'history', selectedLeadId],
    queryFn: () => selectedLeadId ? leadScoringService.getScoreHistory(selectedLeadId) : null,
    enabled: !!selectedLeadId,
  });

  // Recalculate score mutation
  const recalculateMutation = useMutation({
    mutationFn: (leadId: string) => leadScoringService.recalculateScore(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-scoring'] });
      toast.success('Score recalculated successfully');
    },
    onError: () => toast.error('Failed to recalculate score'),
  });

  // Calculate stats from leads
  const stats = useMemo(() => {
    const leads = leadsData?.items || [];
    const qualifiedCount = leads.filter(l => (l.score || 0) >= (config?.qualificationThreshold || 70)).length;
    const avgScore = leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
      : 0;
    const hotLeads = leads.filter(l => (l.score || 0) >= 80).length;

    return [
      { label: 'Total Leads', value: leads.length.toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: 'Qualified', value: qualifiedCount.toString(), icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
      { label: 'Avg Score', value: avgScore.toString(), icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
      { label: 'Hot Leads', value: hotLeads.toString(), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    ];
  }, [leadsData, config]);

  // Sort leads by score (highest first)
  const sortedLeads = useMemo(() => {
    const leads = leadsData?.items || [];
    return [...leads].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [leadsData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    if (score >= 40) return 'Cool';
    return 'Cold';
  };

  const isLoading = leadsLoading || configLoading;

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Lead Scoring</h1>
            <p className="body-text mt-2 text-text-secondary">
              AI-powered lead scoring and prioritization
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-[10px]">
            <Settings className="size-4" />
            Configure Rules
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-xl" />
            ))
          ) : (
            stats.map((stat, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="small-text text-text-secondary">{stat.label}</p>
                    <p className="text-3xl font-normal text-text-navy">{stat.value}</p>
                  </div>
                  <div className={cn('rounded-lg p-3', stat.bgColor)}>
                    <stat.icon className={cn('size-6', stat.color)} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* BANT Configuration Display */}
        {config && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading-3 text-text-navy">BANT Scoring Weights</h2>
              <Badge variant="outline">Qualification Threshold: {config.qualificationThreshold}</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                <DollarSign className="size-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-800 font-medium">Budget</p>
                  <p className="text-2xl font-bold text-emerald-600">{config.bantWeights.budget}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50">
                <UserCheck className="size-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Authority</p>
                  <p className="text-2xl font-bold text-blue-600">{config.bantWeights.authority}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50">
                <AlertCircle className="size-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-800 font-medium">Need</p>
                  <p className="text-2xl font-bold text-purple-600">{config.bantWeights.need}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50">
                <Clock className="size-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-800 font-medium">Timeline</p>
                  <p className="text-2xl font-bold text-orange-600">{config.bantWeights.timeline}%</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Leads List */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-2 text-text-navy">Lead Scores</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
              >
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : sortedLeads.length > 0 ? (
              <div className="space-y-3">
                {sortedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                      selectedLeadId === lead.id
                        ? 'border-purple-500 bg-purple-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex size-12 items-center justify-center rounded-full font-bold text-lg',
                          getScoreColor(lead.score || 0)
                        )}>
                          {lead.score || 0}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-navy">
                            {lead.firstName} {lead.lastName}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {lead.email || lead.phone || 'No contact info'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn('text-xs', getScoreColor(lead.score || 0))}>
                          {getScoreLabel(lead.score || 0)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            recalculateMutation.mutate(lead.id);
                          }}
                          disabled={recalculateMutation.isPending}
                        >
                          {recalculateMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <RefreshCw className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={lead.score || 0} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="size-12 mx-auto text-gray-300 mb-4" />
                <p className="text-text-secondary">No leads to score yet</p>
              </div>
            )}
          </Card>

          {/* Score History */}
          <Card className="p-6">
            <h2 className="heading-3 text-text-navy mb-4">Score History</h2>
            {!selectedLeadId ? (
              <div className="text-center py-12">
                <BarChart3 className="size-12 mx-auto text-gray-300 mb-4" />
                <p className="text-sm text-text-secondary">
                  Select a lead to view score history
                </p>
              </div>
            ) : historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : scoreHistory && scoreHistory.length > 0 ? (
              <div className="space-y-3">
                {scoreHistory.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-text-navy">{entry.score}</span>
                        {entry.scoreChange !== 0 && (
                          <span className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            entry.scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {entry.scoreChange > 0 ? (
                              <TrendingUp className="size-4" />
                            ) : (
                              <TrendingDown className="size-4" />
                            )}
                            {entry.scoreChange > 0 ? '+' : ''}{entry.scoreChange}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        {new Date(entry.scoredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{entry.source}</p>
                    {entry.reason && (
                      <p className="text-xs text-text-muted mt-1">{entry.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary">No score history available</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
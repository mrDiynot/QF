'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  TrendingUp, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Clock,
  Target,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { leadsService } from '@/services/api/leads.service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface QualificationResult {
  leadId: string;
  score: number;
  isQualified: boolean;
  reasoning: string;
  criterionScores: CriterionScore[];
  suggestedActions?: string[];
  confidence: number;
  qualifiedAt: string;
  fromCache: boolean;
  tokensUsed: number;
}

interface CriterionScore {
  criterion: string;
  score: number;
  weight: number;
  reasoning: string;
}

export default function LeadQualificationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await leadsService.getLeads();
      return response.items || [];
    },
  });

  const { data: qualificationResult, isLoading: qualifyLoading } = useQuery({
    queryKey: ['lead-qualification', selectedLeadId],
    queryFn: async () => {
      if (!selectedLeadId) return null;
      const response = await fetch(`/api/v1/ai/qualify-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          leadId: selectedLeadId,
          forceRequalify: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to qualify lead');
      return response.json() as Promise<QualificationResult>;
    },
    enabled: !!selectedLeadId,
  });

  const requalifyMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/v1/ai/qualify-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          leadId,
          forceRequalify: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to requalify lead');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-qualification'] });
      toast.success('Lead requalified successfully');
    },
    onError: () => {
      toast.error('Failed to requalify lead');
    },
  });

  const filteredLeads = leads.filter(lead =>
    `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCriterionIcon = (criterion: string) => {
    const lower = criterion.toLowerCase();
    if (lower.includes('budget')) return DollarSign;
    if (lower.includes('authority')) return User;
    if (lower.includes('need')) return Target;
    if (lower.includes('timeline')) return Calendar;
    return CheckCircle2;
  };

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="size-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-text-navy">AI Lead Qualification</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Intelligent BANT scoring powered by OpenAI
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Leads List */}
        <div className="col-span-4">
          <Card className="h-[calc(100vh-300px)]">
            <CardHeader>
              <CardTitle className="text-lg">Leads</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[calc(100vh-450px)]">
                {leadsLoading ? (
                  <div className="p-8 text-center text-text-secondary">
                    Loading leads...
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">
                    No leads found
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                        selectedLeadId === lead.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-xs text-text-secondary truncate mt-1">
                            {lead.email}
                          </p>
                          {lead.company && (
                            <p className="text-xs text-text-secondary truncate mt-1">
                              {lead.company}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {lead.status}
                            </Badge>
                            {lead.score !== undefined && (
                              <Badge className={`text-xs ${getScoreColor(lead.score)}`}>
                                Score: {lead.score}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Qualification Results */}
        <div className="col-span-8">
          <Card className="h-[calc(100vh-300px)]">
            {selectedLeadId && qualificationResult ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Qualification Analysis</CardTitle>
                      <p className="text-sm text-text-secondary mt-1">
                        Analyzed {formatDistanceToNow(new Date(qualificationResult.qualifiedAt), { addSuffix: true })}
                        {qualificationResult.fromCache && ' (cached)'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requalifyMutation.mutate(selectedLeadId)}
                      disabled={requalifyMutation.isPending}
                      className="gap-2"
                    >
                      {requalifyMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Brain className="size-4" />
                      )}
                      Requalify
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-450px)]">
                  {/* Overall Score */}
                  <div className={`p-6 rounded-lg border-2 ${getScoreColor(qualificationResult.score)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {qualificationResult.isQualified ? (
                          <CheckCircle2 className="size-8 text-green-600" />
                        ) : (
                          <XCircle className="size-8 text-red-600" />
                        )}
                        <div>
                          <h3 className="text-lg font-bold">
                            {qualificationResult.isQualified ? 'Qualified Lead' : 'Not Qualified'}
                          </h3>
                          <p className="text-sm opacity-80">
                            Confidence: {(qualificationResult.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{qualificationResult.score}</div>
                        <div className="text-sm opacity-80">out of 100</div>
                      </div>
                    </div>
                  </div>

                  {/* BANT Criteria Scores */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Target className="size-5 text-purple-600" />
                      BANT Criteria Breakdown
                    </h4>
                    <div className="space-y-4">
                      {qualificationResult.criterionScores.map((criterion, index) => {
                        const Icon = getCriterionIcon(criterion.criterion);
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="size-5 text-gray-600" />
                                <span className="font-semibold">{criterion.criterion}</span>
                              </div>
                              <Badge className={getScoreColor(criterion.score)}>
                                {criterion.score}/100
                              </Badge>
                            </div>
                            <p className="text-sm text-text-secondary">
                              {criterion.reasoning}
                            </p>
                            <div className="mt-2 text-xs text-text-secondary">
                              Weight: {(criterion.weight * 100).toFixed(0)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="size-5 text-purple-600" />
                      AI Analysis
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {qualificationResult.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  {qualificationResult.suggestedActions && qualificationResult.suggestedActions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="size-5 text-purple-600" />
                        Suggested Next Steps
                      </h4>
                      <div className="space-y-2">
                        {qualificationResult.suggestedActions.map((action, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <ArrowRight className="size-5 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDistanceToNow(new Date(qualificationResult.qualifiedAt), { addSuffix: true })}
                        </span>
                        <span>Tokens: {qualificationResult.tokensUsed}</span>
                      </div>
                      <Link
                        href={`/leads/${selectedLeadId}`}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View Lead Details →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : qualifyLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="size-12 mx-auto mb-4 text-purple-600 animate-spin" />
                  <p className="text-text-secondary">Analyzing lead with AI...</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="text-center">
                  <Brain className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Select a lead to view AI qualification analysis</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

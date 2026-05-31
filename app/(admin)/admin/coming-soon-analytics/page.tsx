'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  MessageSquare, RefreshCw, AlertCircle,
  Mail, Sparkles, Target,
  Globe, Zap, BarChart3, ChevronLeft, ChevronRight,
  Radio, ArrowDownRight, ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '@/components/admin/blocks/StatCard';
import { brandColors, semanticColors } from '@/lib/design-tokens';
import {
  useComingSoonOverview, useComingSoonChatSessions, useComingSoonWaitlist,
  useComingSoonAIUsage, useComingSoonIntentDistribution, useComingSoonConversionFunnel,
} from '@/hooks/admin';

export default function ComingSoonAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionsPage, setSessionsPage] = useState(1);
  const [waitlistPage, setWaitlistPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: overview, isLoading: overviewLoading, isError: overviewError, refetch: refetchOverview, isRefetching: overviewRefetching } = useComingSoonOverview();
  const { data: chatSessions, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions, isRefetching: sessionsRefetching } = useComingSoonChatSessions(sessionsPage, PAGE_SIZE);
  const { data: waitlist, isLoading: waitlistLoading, isError: waitlistError, refetch: refetchWaitlist, isRefetching: waitlistRefetching } = useComingSoonWaitlist(waitlistPage, PAGE_SIZE);
  const { data: aiUsage, isLoading: aiLoading, isError: aiError, refetch: refetchAI, isRefetching: aiRefetching } = useComingSoonAIUsage();
  const { data: intents, isLoading: intentsLoading, isError: intentsError, refetch: refetchIntents, isRefetching: intentsRefetching } = useComingSoonIntentDistribution();
  const { data: funnel, isLoading: funnelLoading, isError: funnelError, refetch: refetchFunnel, isRefetching: funnelRefetching } = useComingSoonConversionFunnel();

  const loading = overviewLoading || sessionsLoading || waitlistLoading || aiLoading || intentsLoading || funnelLoading;
  const refreshing = overviewRefetching || sessionsRefetching || waitlistRefetching || aiRefetching || intentsRefetching || funnelRefetching;
  const hasError = overviewError || sessionsError || waitlistError || aiError || intentsError || funnelError;

  const handleRefresh = () => {
    refetchOverview(); refetchSessions(); refetchWaitlist();
    refetchAI(); refetchIntents(); refetchFunnel();
  };

  const fmt = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const fmtDuration = (minutes: number) => {
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    return `${(minutes / 60).toFixed(1)} hrs`;
  };

  const fmtDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const conversionRate = overview?.totalChatSessions && overview?.waitlistSignups
    ? ((overview.waitlistSignups / overview.totalChatSessions) * 100).toFixed(1)
    : '0.0';

  const sessionsTotalPages = chatSessions?.totalCount ? Math.ceil(chatSessions.totalCount / PAGE_SIZE) : 1;
  const waitlistTotalPages = waitlist?.totalCount ? Math.ceil(waitlist.totalCount / PAGE_SIZE) : 1;

  const sentimentLabel = (score: number | null) => {
    if (score === null || score === undefined) return { text: 'N/A', color: 'text-admin-muted-foreground' };
    if (score >= 0.6) return { text: 'Positive', color: 'text-green-400' };
    if (score >= 0.3) return { text: 'Neutral', color: 'text-yellow-400' };
    return { text: 'Negative', color: 'text-red-400' };
  };

  const sourceIcon = (source: string | null) => {
    if (!source) return <Globe className="h-3.5 w-3.5" />;
    if (source.includes('chat')) return <MessageSquare className="h-3.5 w-3.5" />;
    if (source.includes('hero') || source.includes('journey')) return <ArrowDownRight className="h-3.5 w-3.5" />;
    if (source.includes('waitlist')) return <Mail className="h-3.5 w-3.5" />;
    return <Globe className="h-3.5 w-3.5" />;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-72 bg-admin-muted" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 bg-admin-muted rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-96 bg-admin-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 bg-admin-muted rounded-xl" />
          <Skeleton className="h-72 bg-admin-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-admin-foreground tracking-tight">
              Coming Soon Analytics
            </h1>
            <p className="text-sm text-admin-muted-foreground mt-0.5">
              Pre-launch engagement · AI chat · Waitlist pipeline
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1.5">
            <Radio className="h-3 w-3 animate-pulse" />
            Live
          </Badge>
        </div>
        <Button
          variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}
          className="border-admin-border text-admin-foreground hover:bg-admin-muted"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Error Banner ── */}
      {hasError && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-red-400">Failed to load some data</span>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}
              className="border-red-500/30 text-red-400 hover:bg-red-500/20 h-7 text-xs">
              <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── 6 Metric Cards (consistent StatCard component) ── */}
      <Card className="shadow-base">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Chat Sessions"
              value={overview?.totalChatSessions ?? 0}
              changeLabel={`${fmt(overview?.totalMessages ?? 0)} messages total`}
              iconColor="text-dashcode-info"
              loading={overviewLoading}
              className="border-none shadow-none bg-info-10"
              sparklineColor={brandColors.accent[400]}
            />
            <StatCard
              title="Waitlist Signups"
              value={overview?.waitlistSignups ?? 0}
              changeLabel={`${conversionRate}% conversion rate`}
              iconColor="text-emerald-400"
              loading={overviewLoading}
              className="border-none shadow-none bg-success-10"
              sparklineColor={semanticColors.success.main}
            />
            <StatCard
              title="Unique Visitors"
              value={overview?.uniqueVisitors ?? 0}
              changeLabel={`${fmt(overview?.emailsCaptured ?? 0)} emails captured`}
              iconColor="text-dashcode-primary"
              loading={overviewLoading}
              className="border-none shadow-none bg-primary-10"
              sparklineColor={brandColors.primary[500]}
            />
            <StatCard
              title="Avg Duration"
              value={fmtDuration(overview?.averageSessionDuration ?? 0)}
              changeLabel={`Avg sentiment: ${(overview?.averageSentiment ?? 0).toFixed(2)}`}
              iconColor="text-dashcode-warning"
              loading={overviewLoading}
              className="border-none shadow-none bg-warning-10"
              sparklineColor={semanticColors.warning.main}
            />
            <StatCard
              title="AI Tokens Used"
              value={fmt(overview?.totalTokensUsed ?? aiUsage?.totalTokens ?? 0)}
              changeLabel={`${fmtCurrency(overview?.totalAICostUsd ?? aiUsage?.estimatedCost ?? 0)} cost`}
              iconColor="text-purple-400"
              loading={overviewLoading || aiLoading}
              className="border-none shadow-none bg-info-10"
              sparklineColor={brandColors.secondary[500]}
            />
            <StatCard
              title="AI Responses"
              value={overview?.totalAIResponses ?? aiUsage?.totalRequests ?? 0}
              changeLabel={`${fmt(aiUsage?.averageTokensPerRequest ?? 0)} avg tokens/req`}
              iconColor="text-orange-400"
              loading={overviewLoading || aiLoading}
              className="border-none shadow-none bg-warning-10"
              sparklineColor={semanticColors.warning.main}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-admin-muted border-admin-border h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-admin-card">
            <BarChart3 className="h-4 w-4 mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-admin-card">
            <MessageSquare className="h-4 w-4 mr-1.5" /> Chat Sessions
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="data-[state=active]:bg-admin-card">
            <Mail className="h-4 w-4 mr-1.5" /> Waitlist
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-admin-card">
            <Sparkles className="h-4 w-4 mr-1.5" /> AI &amp; RAG Performance
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-foreground flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-green-400" /> Conversion Funnel
                </CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  Visitor journey → Chat → Email capture → Waitlist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {funnel && funnel.length > 0 ? funnel.map((stage: { stage: string; count: number; percentage: number }, idx: number) => (
                  <div key={stage.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-admin-muted text-[10px] font-bold text-admin-foreground">{idx + 1}</span>
                        <span className="font-medium text-admin-foreground">{stage.stage}</span>
                      </div>
                      <span className="tabular-nums text-admin-muted-foreground">{fmt(stage.count)} <span className="text-xs">({stage.percentage.toFixed(1)}%)</span></span>
                    </div>
                    <div className="w-full bg-admin-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${Math.max(stage.percentage, 2)}%` }} />
                    </div>
                  </div>
                )) : <p className="text-admin-muted-foreground text-center py-8 text-sm">No funnel data yet</p>}
              </CardContent>
            </Card>

            {/* Intent Distribution */}
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-foreground flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-blue-400" /> Intent Distribution
                </CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  What visitors are asking about in AI chat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {intents && intents.length > 0 ? intents.map((intent: { intent: string; count: number; percentage: number }) => {
                  const colors = ['from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400', 'from-amber-500 to-orange-400', 'from-teal-500 to-green-400', 'from-rose-500 to-red-400'];
                  const ci = Math.abs(intent.intent.charCodeAt(0)) % colors.length;
                  return (
                    <div key={intent.intent} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-admin-foreground truncate max-w-[180px]">{intent.intent}</span>
                        <span className="tabular-nums text-admin-muted-foreground">{fmt(intent.count)} <span className="text-xs">({intent.percentage.toFixed(1)}%)</span></span>
                      </div>
                      <div className="w-full bg-admin-muted rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full bg-gradient-to-r ${colors[ci]} transition-all`} style={{ width: `${Math.max(intent.percentage, 2)}%` }} />
                      </div>
                    </div>
                  );
                }) : <p className="text-admin-muted-foreground text-center py-8 text-sm">No intent data yet</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════ CHAT SESSIONS TAB ═══════════ */}
        <TabsContent value="sessions" className="mt-4">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-admin-foreground text-base">Chat Sessions</CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  {chatSessions?.totalCount ?? 0} total sessions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-admin-border hover:bg-transparent">
                    <TableHead className="text-admin-muted-foreground">Visitor</TableHead>
                    <TableHead className="text-admin-muted-foreground">Msgs</TableHead>
                    <TableHead className="text-admin-muted-foreground">Sentiment</TableHead>
                    <TableHead className="text-admin-muted-foreground">Intent</TableHead>
                    <TableHead className="text-admin-muted-foreground">Duration</TableHead>
                    <TableHead className="text-admin-muted-foreground">Started</TableHead>
                    <TableHead className="text-admin-muted-foreground text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chatSessions?.items && chatSessions.items.length > 0 ? chatSessions.items.map((s: { id: string; visitorEmail: string | null; messageCount: number; sentimentScore: number; startedAt: string; status: string; detectedIntent?: string; duration?: string }) => {
                    const sl = sentimentLabel(s.sentimentScore);
                    return (
                      <TableRow key={s.id} className="border-admin-border hover:bg-admin-muted/50">
                        <TableCell className="font-medium text-admin-foreground max-w-[180px] truncate">
                          {s.visitorEmail || <span className="text-admin-muted-foreground italic">Anonymous</span>}
                        </TableCell>
                        <TableCell className="text-admin-foreground tabular-nums">{s.messageCount}</TableCell>
                        <TableCell><span className={`text-xs font-medium ${sl.color}`}>{sl.text}</span></TableCell>
                        <TableCell>
                          {s.detectedIntent ? (
                            <Badge variant="outline" className="border-admin-border text-admin-foreground text-[10px]">{s.detectedIntent}</Badge>
                          ) : <span className="text-admin-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-admin-foreground text-xs tabular-nums">
                          {s.duration ? fmtDuration(parseFloat(s.duration.split(':')[0]) * 60 + parseFloat(s.duration.split(':')[1])) : '—'}
                        </TableCell>
                        <TableCell className="text-admin-muted-foreground text-xs">{fmtDate(s.startedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={`text-[10px] ${s.status === 'active' ? 'border-green-500/40 text-green-400' : 'border-admin-border text-admin-muted-foreground'}`}>
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow className="border-admin-border">
                      <TableCell colSpan={7} className="text-center text-admin-muted-foreground py-12">No chat sessions yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination */}
              {sessionsTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-admin-border mt-4">
                  <span className="text-xs text-admin-muted-foreground">Page {sessionsPage} of {sessionsTotalPages}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={sessionsPage <= 1} onClick={() => setSessionsPage(p => p - 1)}
                      className="h-7 w-7 p-0 border-admin-border text-admin-foreground"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" disabled={sessionsPage >= sessionsTotalPages} onClick={() => setSessionsPage(p => p + 1)}
                      className="h-7 w-7 p-0 border-admin-border text-admin-foreground"><ChevronRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ WAITLIST TAB ═══════════ */}
        <TabsContent value="waitlist" className="mt-4">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-admin-foreground text-base">Waitlist Entries</CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  {waitlist?.totalCount ?? 0} total signups · Brevo sync status
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-admin-border hover:bg-transparent">
                    <TableHead className="text-admin-muted-foreground">Email</TableHead>
                    <TableHead className="text-admin-muted-foreground">Source</TableHead>
                    <TableHead className="text-admin-muted-foreground">Page</TableHead>
                    <TableHead className="text-admin-muted-foreground">Referrer</TableHead>
                    <TableHead className="text-admin-muted-foreground">Brevo</TableHead>
                    <TableHead className="text-admin-muted-foreground text-right">Signed Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlist?.items && waitlist.items.length > 0 ? waitlist.items.map((e: { id: string; email: string; source: string; brevoSynced: boolean; createdAt: string; pageUrl?: string; referrerUrl?: string; syncedToBrevo?: boolean; signedUpAt?: string }) => (
                    <TableRow key={e.id} className="border-admin-border hover:bg-admin-muted/50">
                      <TableCell className="font-medium text-admin-foreground">{e.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-admin-foreground">
                          {sourceIcon(e.source)} {e.source || 'direct'}
                        </div>
                      </TableCell>
                      <TableCell className="text-admin-muted-foreground text-xs max-w-[140px] truncate">{e.pageUrl || '—'}</TableCell>
                      <TableCell className="text-admin-muted-foreground text-xs max-w-[140px] truncate">{e.referrerUrl || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${e.syncedToBrevo ? 'border-green-500/40 text-green-400' : 'border-amber-500/40 text-amber-400'}`}>
                          {e.syncedToBrevo ? '✓ Synced' : '⏳ Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-admin-muted-foreground text-xs">{fmtDate(e.signedUpAt ?? e.createdAt)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow className="border-admin-border">
                      <TableCell colSpan={6} className="text-center text-admin-muted-foreground py-12">No waitlist signups yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination */}
              {waitlistTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-admin-border mt-4">
                  <span className="text-xs text-admin-muted-foreground">Page {waitlistPage} of {waitlistTotalPages}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={waitlistPage <= 1} onClick={() => setWaitlistPage(p => p - 1)}
                      className="h-7 w-7 p-0 border-admin-border text-admin-foreground"><ChevronLeft className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" disabled={waitlistPage >= waitlistTotalPages} onClick={() => setWaitlistPage(p => p + 1)}
                      className="h-7 w-7 p-0 border-admin-border text-admin-foreground"><ChevronRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ AI & RAG PERFORMANCE TAB ═══════════ */}
        <TabsContent value="ai" className="mt-4 space-y-6">
          {/* AI Usage Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-admin-muted-foreground mb-2">Total AI Requests</p>
                <p className="text-2xl font-bold text-admin-foreground">{fmt(aiUsage?.totalRequests ?? 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-admin-muted-foreground mb-2">Input Tokens</p>
                <p className="text-2xl font-bold text-admin-foreground">{fmt(aiUsage?.inputTokens ?? 0)}</p>
                <p className="text-xs text-admin-muted-foreground mt-1">prompt / context</p>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-admin-muted-foreground mb-2">Output Tokens</p>
                <p className="text-2xl font-bold text-admin-foreground">{fmt(aiUsage?.outputTokens ?? 0)}</p>
                <p className="text-xs text-admin-muted-foreground mt-1">completion / response</p>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-admin-border">
              <CardContent className="pt-5 pb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-admin-muted-foreground mb-2">Estimated Cost</p>
                <p className="text-2xl font-bold text-admin-foreground">{fmtCurrency(aiUsage?.estimatedCost ?? 0)}</p>
                <p className="text-xs text-admin-muted-foreground mt-1">OpenAI billing estimate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAG / Vector Pipeline */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-600/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-admin-foreground flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-purple-400" /> RAG &amp; Vector Pipeline
                </CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  Knowledge base retrieval &amp; pgvector similarity search
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-admin-muted/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-300/80 mb-1">Embedding Model</p>
                    <p className="text-sm font-semibold text-admin-foreground">text-embedding-3-small</p>
                  </div>
                  <div className="rounded-lg bg-admin-muted/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-300/80 mb-1">Vector Dimensions</p>
                    <p className="text-sm font-semibold text-admin-foreground">1536</p>
                  </div>
                  <div className="rounded-lg bg-admin-muted/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-300/80 mb-1">Similarity Method</p>
                    <p className="text-sm font-semibold text-admin-foreground">Cosine (pgvector)</p>
                  </div>
                  <div className="rounded-lg bg-admin-muted/50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-purple-300/80 mb-1">Chat Model</p>
                    <p className="text-sm font-semibold text-admin-foreground">GPT-4</p>
                  </div>
                </div>
                <div className="border-t border-admin-border pt-3 space-y-2">
                  <h4 className="text-xs font-medium text-admin-muted-foreground uppercase tracking-wider">Pipeline Flow</h4>
                  <div className="flex items-center gap-2 text-xs text-admin-foreground">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">1. User Query</Badge>
                    <ArrowUpRight className="h-3 w-3 text-admin-muted-foreground" />
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">2. Embed Query</Badge>
                    <ArrowUpRight className="h-3 w-3 text-admin-muted-foreground" />
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">3. Vector Search</Badge>
                    <ArrowUpRight className="h-3 w-3 text-admin-muted-foreground" />
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[10px]">4. Augmented Response</Badge>
                  </div>
                </div>
                <div className="border-t border-admin-border pt-3 space-y-2">
                  <h4 className="text-xs font-medium text-admin-muted-foreground uppercase tracking-wider">Knowledge Sources</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-admin-foreground">Knowledge Base Documents</span>
                      <span className="text-admin-muted-foreground">Chunked &amp; embedded in pgvector</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-admin-foreground">FAQ Entries</span>
                      <span className="text-admin-muted-foreground">Semantic similarity matching</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-admin-foreground">Conversation Memory</span>
                      <span className="text-admin-muted-foreground">Context recall via embeddings</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Breakdown */}
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="text-admin-foreground flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-orange-400" /> Token Usage Breakdown
                </CardTitle>
                <CardDescription className="text-admin-muted-foreground text-xs">
                  Input vs Output token distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const total = (aiUsage?.inputTokens ?? 0) + (aiUsage?.outputTokens ?? 0);
                  const inputPct = total > 0 ? ((aiUsage?.inputTokens ?? 0) / total * 100) : 0;
                  const outputPct = total > 0 ? ((aiUsage?.outputTokens ?? 0) / total * 100) : 0;
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-admin-foreground font-medium">Input Tokens (Prompt + RAG Context)</span>
                          <span className="tabular-nums text-admin-muted-foreground">{fmt(aiUsage?.inputTokens ?? 0)} ({inputPct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-admin-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${inputPct}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-admin-foreground font-medium">Output Tokens (AI Response)</span>
                          <span className="tabular-nums text-admin-muted-foreground">{fmt(aiUsage?.outputTokens ?? 0)} ({outputPct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-admin-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${outputPct}%` }} />
                        </div>
                      </div>
                      <div className="border-t border-admin-border pt-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-admin-foreground">Total</span>
                          <span className="font-semibold tabular-nums text-admin-foreground">{fmt(total)}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
                <div className="border-t border-admin-border pt-3 space-y-2">
                  <h4 className="text-xs font-medium text-admin-muted-foreground uppercase tracking-wider">Efficiency</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-admin-foreground">Avg tokens per request</span>
                    <span className="font-medium tabular-nums text-admin-foreground">{fmt(aiUsage?.averageTokensPerRequest ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-admin-foreground">Cost per request</span>
                    <span className="font-medium tabular-nums text-admin-foreground">
                      {aiUsage?.totalRequests ? fmtCurrency((aiUsage?.estimatedCost ?? 0) / aiUsage.totalRequests) : '$0.00'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
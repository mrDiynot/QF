'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Zap,
  MessageSquare,
  Phone,
  Activity,
} from 'lucide-react';
import { useAdminAIUsageSummary, useAdminTopAIBusinesses } from '@/hooks/admin';
import { PageHeader, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatCard } from '@/components/admin/blocks/StatCard';

export default function AiUsagePage() {
  // Use React Query hooks for real data
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary, isRefetching: summaryRefetching } = useAdminAIUsageSummary();
  const { data: topBusinesses, isLoading: businessesLoading, isError: businessesError, refetch: refetchBusinesses, isRefetching: businessesRefetching } = useAdminTopAIBusinesses();

  const loading = summaryLoading || businessesLoading;
  const refreshing = summaryRefetching || businessesRefetching;
  const hasError = summaryError || businessesError;

  const handleRefresh = () => {
    refetchSummary();
    refetchBusinesses();
  };

  // Derive metrics from summary
  const totalTokens = (summary?.totalInputTokens ?? 0) + (summary?.totalOutputTokens ?? 0);
  const avgTokensPerRequest = summary?.totalOpenAIRequests ? Math.round(totalTokens / summary.totalOpenAIRequests) : 512;

  // Derive feature breakdown from operation breakdown
  const operationBreakdown = summary?.operationBreakdown ?? {};
  const totalRequests = (Object.values(operationBreakdown) as number[]).reduce((a: number, b: number) => a + b, 0) || 1;
  const featureBreakdown = Object.entries(operationBreakdown).map(([feature, requests]) => ({
    feature,
    requests: requests as number,
    percentage: ((requests as number) / totalRequests) * 100,
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Define columns for top consumers table
  const topConsumerColumns: DataTableColumn<NonNullable<typeof topBusinesses>[number]>[] = [
    {
      key: 'business',
      label: 'Business',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-admin-foreground">{row.businessName || row.businessId}</span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: () => (
        <Badge variant="outline" className="border-admin-border text-admin-foreground">-</Badge>
      ),
    },
    {
      key: 'tokens',
      label: 'Requests',
      sortable: true,
      render: (row) => <span className="text-admin-foreground">{formatNumber(row.totalOpenAIRequests)}</span>,
    },
    {
      key: 'sms',
      label: 'SMS',
      sortable: true,
      render: (row) => <span className="text-admin-foreground">{formatNumber(row.totalSmsMessages)}</span>,
    },
    {
      key: 'cost',
      label: 'Est. Cost',
      align: 'right' as const,
      sortable: true,
      render: (row) => <span className="text-green-400 font-medium">{formatCurrency(row.totalEstimatedCost)}</span>,
    },
  ];

  // Paginate top businesses
  const allBusinesses = topBusinesses || [];
  const totalPages = Math.ceil(allBusinesses.length / pageSize);
  const paginatedBusinesses = allBusinesses.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="AI Usage"
        description="Monitor AI consumption across the platform"
        isError={hasError}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tokens" value={formatNumber(totalTokens)} iconColor="text-purple-400" changeLabel="this month" loading={loading} />
        <StatCard title="Total Requests" value={formatNumber(summary?.totalOpenAIRequests ?? 0)} iconColor="text-amber-400" changeLabel="AI API calls" loading={loading} />
        <StatCard title="Estimated Cost" value={formatCurrency(summary?.estimatedOpenAICost ?? 0)} iconColor="text-green-400" changeLabel="OpenAI API costs" loading={loading} />
        <StatCard title="Avg Tokens/Request" value={avgTokensPerRequest} iconColor="text-blue-400" changeLabel="tokens per request" loading={loading} />
      </div>

      {/* Usage by Feature */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Usage by Feature
          </CardTitle>
          <CardDescription className="text-admin-muted-foreground">
            AI consumption breakdown by product feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureBreakdown.length > 0 ? featureBreakdown.map((feature) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {feature.feature === 'Lead Qualification' && <MessageSquare className="h-4 w-4 text-blue-400" />}
                    {feature.feature === 'Conversation AI' && <MessageSquare className="h-4 w-4 text-green-400" />}
                    {feature.feature === 'Voice AI' && <Phone className="h-4 w-4 text-purple-400" />}
                    {feature.feature === 'Email Generation' && <Zap className="h-4 w-4 text-amber-400" />}
                    {feature.feature === 'Knowledge Base' && <Brain className="h-4 w-4 text-pink-400" />}
                    {!['Lead Qualification', 'Conversation AI', 'Voice AI', 'Email Generation', 'Knowledge Base'].includes(feature.feature) && <Activity className="h-4 w-4 text-admin-muted-foreground" />}
                    <span className="text-sm font-medium text-admin-foreground">{feature.feature}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-admin-muted-foreground">
                      {formatNumber(feature.requests)} requests
                    </span>
                    <Badge variant="outline" className="border-admin-border text-admin-foreground">
                      {feature.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-admin-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${feature.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-admin-muted-foreground text-center py-4">No usage data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top AI Consumers Table */}
      <DataTable
        columns={topConsumerColumns}
        data={paginatedBusinesses}
        loading={businessesLoading}
        emptyMessage="No usage data available"
        emptyDescription="AI usage data will appear here once businesses start using AI features"
        getRowId={(row) => row.businessId}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={allBusinesses.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

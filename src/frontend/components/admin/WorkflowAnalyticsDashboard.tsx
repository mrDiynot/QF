'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Zap, Users, CheckCircle2 } from 'lucide-react';

interface WorkflowMetric {
  id: string;
  name: string;
  executions: number;
  successRate: number;
  avgDuration: number;
  activeUsers: number;
  trend: 'up' | 'down';
  trendValue: number;
}

export function WorkflowAnalyticsDashboard() {
  const metrics: WorkflowMetric[] = [
    {
      id: '1',
      name: 'Lead Qualification',
      executions: 1250,
      successRate: 94.5,
      avgDuration: 45,
      activeUsers: 89,
      trend: 'up',
      trendValue: 12.5,
    },
    {
      id: '2',
      name: 'Follow-up Sequence',
      executions: 890,
      successRate: 87.2,
      avgDuration: 120,
      activeUsers: 67,
      trend: 'up',
      trendValue: 8.3,
    },
    {
      id: '3',
      name: 'Email Welcome',
      executions: 2100,
      successRate: 98.1,
      avgDuration: 15,
      activeUsers: 156,
      trend: 'down',
      trendValue: 3.2,
    },
  ];

  const totalStats = {
    totalExecutions: metrics.reduce((sum, m) => sum + m.executions, 0),
    avgSuccessRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length,
    totalActiveUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="size-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-text-secondary">All workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-text-secondary">Across all workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalActiveUsers}</div>
            <p className="text-xs text-text-secondary">Using workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{metric.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {metric.executions.toLocaleString()} executions
                  </p>
                </div>
                <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {metric.trendValue}%
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Success Rate</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{metric.successRate}%</span>
                    </div>
                    <Progress value={metric.successRate} className="h-2" />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">Avg Duration</p>
                  <div className="flex items-center gap-1">
                    <Zap className="size-3 text-[#FF6900]" />
                    <span className="text-sm font-semibold">{metric.avgDuration}s</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-secondary mb-1">Active Users</p>
                  <div className="flex items-center gap-1">
                    <Users className="size-3 text-info" />
                    <span className="text-sm font-semibold">{metric.activeUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

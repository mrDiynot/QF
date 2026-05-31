'use client';

/**
 * Workflow Detail Page
 * Shows workflow configuration, execution history, and analytics
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Zap,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { workflowsService } from '@/services/api/workflows.service';
import { toast } from 'sonner';

export default function WorkflowDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch workflow details
  const { data: workflow, isLoading: isLoadingWorkflow, error: workflowError } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => workflowsService.getWorkflowById(workflowId),
    enabled: !!workflowId,
  });

  // Fetch workflow executions
  const { data: executionsData, isLoading: isLoadingExecutions } = useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: () => workflowsService.getExecutions(workflowId, { pageSize: 10 }),
    enabled: !!workflowId,
  });

  // Toggle workflow active state
  const toggleWorkflowMutation = useMutation({
    mutationFn: (isActive: boolean) => workflowsService.toggleActive(workflowId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow status updated');
    },
    onError: () => {
      toast.error('Failed to update workflow status');
    },
  });

  const toggleWorkflow = () => {
    if (workflow) {
      toggleWorkflowMutation.mutate(!workflow.isActive);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    return `${seconds}s`;
  };

  // Calculate analytics from executions
  const recentExecutions = executionsData?.items || [];
  const totalExecutions = executionsData?.totalCount || 0;
  const successfulExecutions = recentExecutions.filter(e => e.status === 'completed').length;
  const failedExecutions = recentExecutions.filter(e => e.status === 'failed').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  // Calculate average duration from recent executions
  const avgDuration = recentExecutions.length > 0
    ? Math.round(
        recentExecutions.reduce((acc, exec) => {
          const duration = new Date(exec.completedAt || exec.startedAt).getTime() - new Date(exec.startedAt).getTime();
          return acc + duration / 1000;
        }, 0) / recentExecutions.length
      )
    : 0;

  // Loading state
  if (isLoadingWorkflow) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (workflowError || !workflow) {
    return (
      <div className="p-8">
        <Card className="p-8">
          <div className="text-center">
            <AlertCircle className="size-12 mx-auto text-red-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load workflow</h3>
            <p className="text-sm text-gray-500 mb-4">The workflow could not be found</p>
            <Button onClick={() => router.push('/workflows')}>Back to Workflows</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/workflows')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text-navy">{workflow.name}</h1>
              {workflow.isActive ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="size-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  <Pause className="size-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-text-secondary mt-1">{workflow.description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/workflows/${workflowId}/settings`)}
            className="gap-2"
          >
            <Settings className="size-4" />
            Configure
          </Button>
          <Button
            variant={workflow.isActive ? "outline" : "default"}
            onClick={toggleWorkflow}
            className="gap-2"
          >
            {workflow.isActive ? (
              <>
                <Pause className="size-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-4" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Executions</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {totalExecutions.toLocaleString()}
              </p>
            </div>
            <Activity className="size-8 text-brand-purple" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Success Rate</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {successRate}%
              </p>
            </div>
            <TrendingUp className="size-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Duration</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {avgDuration}s
              </p>
            </div>
            <Clock className="size-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Failed</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {failedExecutions}
              </p>
            </div>
            <AlertCircle className="size-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Workflow Steps */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-navy mb-4">Workflow Steps</h3>
            <div className="space-y-4">
              {workflow.actions?.map((action, index) => (
                <div key={action.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-navy">
                        {action.type.replace('_', ' ')}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Step {action.order}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {JSON.stringify(action.config).substring(0, 100)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trigger Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-navy mb-4">Trigger</h3>
            <div className="flex items-center gap-3">
              <Zap className="size-5 text-brand-orange" />
              <div>
                <p className="font-medium text-text-navy">{workflow.trigger.type.replace('_', ' ')}</p>
                <p className="text-sm text-text-secondary">
                  {workflow.trigger.schedule || 'Event-based trigger'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-navy mb-4">Recent Executions</h3>
            {isLoadingExecutions ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {execution.status === 'completed' ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-text-navy">{execution.triggeredBy}</p>
                        <p className="text-sm text-text-secondary">
                          {formatDate(execution.startedAt)}
                        </p>
                        {execution.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">{execution.errorMessage}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          execution.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {execution.status}
                      </Badge>
                      <p className="text-sm text-text-secondary mt-1">
                        {execution.completedAt
                          ? formatDuration(
                              Math.round(
                                (new Date(execution.completedAt).getTime() -
                                  new Date(execution.startedAt).getTime()) /
                                  1000
                              )
                            )
                          : 'Running...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-navy mb-4">Recent Activity</h3>
            <div className="text-center text-text-secondary py-8">
              <Activity className="size-12 mx-auto mb-2 opacity-50" />
              <p>Detailed analytics coming soon</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-navy mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Success Rate</span>
                  <span className="font-medium text-text-navy">{successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Duration</span>
                  <span className="font-medium text-text-navy">{avgDuration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Executions</span>
                  <span className="font-medium text-text-navy">{totalExecutions}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-navy mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">Successful</span>
                  <span className="font-medium text-text-navy">{successfulExecutions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Failed</span>
                  <span className="font-medium text-text-navy">{failedExecutions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Executed</span>
                  <span className="font-medium text-text-navy text-sm">
                    {workflow.lastExecutedAt
                      ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

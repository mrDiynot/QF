'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Play, Settings, TrendingUp, Users, CheckCircle, Loader2, ChevronDown, ChevronRight, History, Zap } from 'lucide-react';
import { workflowsService } from '@/services/api/workflows.service';
import { toast } from 'sonner';
import { WorkflowExecutionMonitor } from '@/components/automations/WorkflowExecutionMonitor';
import { useWorkflowLimits } from '@/hooks/subscriptions/useWorkflowLimits';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

export default function JourneysPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Subscription enforcement - check workflow limits
  const { data: workflowLimits } = useWorkflowLimits();

  // Fetch workflows from API
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowsService.getWorkflows(),
  });

  // Toggle workflow active state
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      workflowsService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated');
    },
    onError: () => toast.error('Failed to update workflow'),
  });

  // Test workflow trigger
  const testMutation = useMutation({
    mutationFn: (id: string) => workflowsService.testWorkflow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', id] });
      toast.success('Test workflow triggered! Check executions for results.');
      setExpandedWorkflow(id);
    },
    onError: () => toast.error('Failed to trigger test workflow'),
  });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const items = workflows || [];
    const activeCount = items.filter(w => w.isActive).length;
    const totalExecutions = items.reduce((sum, w) => sum + (w.executionCount || 0), 0);
    
    return [
      { label: 'Active Journeys', value: activeCount.toString(), icon: Play },
      { label: 'Total Workflows', value: items.length.toString(), icon: Users },
      { label: 'Executions', value: totalExecutions.toLocaleString(), icon: CheckCircle },
      { label: 'Success Rate', value: '95%', icon: TrendingUp },
    ];
  }, [workflows]);

  if (isLoading) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="mx-auto max-w-[1440px] space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      <div className="mx-auto max-w-[1440px] space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-text-navy">Customer Journeys</h1>
            <p className="body-text mt-2 text-text-secondary">
              Automate your customer journey with AI-powered workflows
            </p>
          </div>
          <Button 
            className="gap-2 rounded-[10px] gradient-primary text-white"
            onClick={() => {
              if (workflowLimits && !workflowLimits.canCreateMore) {
                setUpgradeReason(`You've reached your workflow limit (${workflowLimits.maxWorkflows} workflows). Upgrade to create more.`);
                setShowUpgradeDialog(true);
                return;
              }
              router.push('/journeys/new');
            }}
          >
            <Plus className="size-4" />
            Create Journey
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="small-text text-text-secondary">{stat.label}</p>
                  <p className="text-3xl font-normal text-text-navy">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-3">
                  <stat.icon className="size-6 text-brand-purple" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {workflows && workflows.length > 0 ? workflows.map((workflow) => (
            <Card key={workflow.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg gradient-primary">
                      <TrendingUp className="size-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="heading-3 text-text-navy">{workflow.name}</h3>
                        <span className={`tiny-text rounded-full px-2 py-1 ${
                          workflow.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="small-text text-text-secondary">{workflow.description || 'No description'}</p>
                      <div className="flex gap-6 text-sm">
                        <span className="text-text-secondary">
                          Trigger: <span className="font-normal text-brand-orange">{workflow.trigger?.type || 'N/A'}</span>
                        </span>
                        <span className="text-text-secondary">
                          Executions: <span className="font-normal text-text-navy">{workflow.executionCount || 0}</span>
                        </span>
                        <span className="text-text-secondary">
                          Actions: <span className="font-normal text-success-green">{workflow.actions?.length || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={workflow.isActive} 
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: workflow.id, isActive: checked })}
                      disabled={toggleMutation.isPending}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-[10px]"
                      onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                    >
                      <History className="size-3" />
                      Executions
                      {expandedWorkflow === workflow.id ? (
                        <ChevronDown className="size-3" />
                      ) : (
                        <ChevronRight className="size-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-[10px] text-purple-600 hover:bg-purple-50"
                      onClick={() => testMutation.mutate(workflow.id)}
                      disabled={testMutation.isPending}
                    >
                      {testMutation.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Zap className="size-3" />
                      )}
                      Test
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 rounded-[10px]">
                      <Settings className="size-3" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
              {expandedWorkflow === workflow.id && (
                <div className="border-t bg-gray-50/50 p-6">
                  <WorkflowExecutionMonitor workflowId={workflow.id} />
                </div>
              )}
            </Card>
          )) : (
            <Card className="p-12 text-center">
              <TrendingUp className="size-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create your first customer journey workflow to automate lead engagement.
              </p>
              <Button className="gap-2">
                <Plus className="size-4" />
                Create First Journey
              </Button>
            </Card>
          )}
        </div>

        {/* Upgrade Prompt */}
        <UpgradePrompt
          showDialog={showUpgradeDialog}
          onClose={() => setShowUpgradeDialog(false)}
          feature="Customer Journeys"
          reason={upgradeReason}
          requiredPlan="Smart Flow"
        />
      </div>
    </div>
  );
}
'use client';

/**
 * Admin Business Workflows Page
 * Manage workflows for a specific business
 */

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from '@/components/admin/AdminModal';
import {
  ArrowLeft,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  useBusinessWorkflows,
  useBusinessWorkflowQuota,
  useUpdateBusinessWorkflow,
  useRemoveWorkflowFromBusiness,
} from '@/hooks/admin/useAdminWorkflows';
import type { BusinessWorkflow } from '@/types/admin-workflows';

export default function BusinessWorkflowsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params?.id as string;

  // API hooks
  const { data: workflowsData, isLoading: isLoadingWorkflows } = useBusinessWorkflows(businessId);
  const { data: quota, isLoading: isLoadingQuota } = useBusinessWorkflowQuota(businessId);
  const updateWorkflow = useUpdateBusinessWorkflow();
  const removeWorkflow = useRemoveWorkflowFromBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Computed values - memoize workflows to avoid dependency warnings
  const workflows = useMemo(() => workflowsData || [], [workflowsData]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter((wf) =>
      wf.templateName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workflows, searchQuery]);

  const activeWorkflows = useMemo(() => {
    return workflows.filter((wf) => wf.isActive).length;
  }, [workflows]);

  const totalExecutions = useMemo(() => {
    return workflows.reduce((sum: number, wf) => sum + wf.totalExecutions, 0);
  }, [workflows]);

  const avgSuccessRate = useMemo(() => {
    return workflows.length > 0
      ? workflows.reduce((sum: number, wf) => sum + wf.successRate, 0) / workflows.length
      : 0;
  }, [workflows]);

  const quotaStatus = useMemo(() => {
    if (!quota) return { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Loading...' };
    const usage = (quota.totalWorkflows / quota.maxWorkflows) * 100;
    if (usage >= 100) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Quota Exceeded' };
    if (usage >= 80) return { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Near Limit' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Within Limits' };
  }, [quota]);

  // Handlers
  const handleToggleWorkflow = async (workflowId: string, currentState: boolean) => {
    await updateWorkflow.mutateAsync({
      businessId,
      workflowId,
      data: { isActive: !currentState },
    });
  };

  const handleRemoveWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to remove this workflow?')) return;
    await removeWorkflow.mutateAsync({ businessId, workflowId });
  };

  // Loading state
  if (isLoadingWorkflows || isLoadingQuota) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="size-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-admin-muted-foreground">Loading workflows...</p>
        </div>
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
            onClick={() => router.push(`/admin/businesses/${businessId}`)}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-admin-foreground">
              {quota?.businessName || 'Business'} - Workflows
            </h1>
            <p className="text-admin-muted-foreground mt-1">
              Manage workflows for this business
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-orange-500 hover:bg-orange-600"
          disabled={quota?.isOverQuota}
        >
          <Plus className="size-4" />
          Add Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-admin-card border-admin-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-admin-muted-foreground">Active Workflows</p>
              <p className="text-2xl font-bold text-admin-foreground mt-1">
                {activeWorkflows}/{quota?.maxActiveWorkflows || 0}
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4 bg-admin-card border-admin-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-admin-muted-foreground">Total Executions</p>
              <p className="text-2xl font-bold text-admin-foreground mt-1">
                {totalExecutions.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="size-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-admin-card border-admin-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-admin-muted-foreground">Avg Success Rate</p>
              <p className="text-2xl font-bold text-admin-foreground mt-1">
                {avgSuccessRate.toFixed(1)}%
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
        </Card>

        <Card className={`p-4 ${quotaStatus.bg} border-admin-border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-admin-muted-foreground">Quota Status</p>
              <p className={`text-lg font-bold ${quotaStatus.color} mt-1`}>
                {quotaStatus.label}
              </p>
              <p className="text-xs text-admin-muted-foreground mt-1">
                {quota?.totalWorkflows || 0}/{quota?.maxWorkflows || 0} workflows
              </p>
            </div>
            <AlertCircle className={`size-8 ${quotaStatus.color}`} />
          </div>
        </Card>
      </div>

      {/* Plan Info */}
      <Card className="p-4 bg-admin-card border-admin-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-admin-muted-foreground">Current Plan</p>
            <p className="text-lg font-semibold text-admin-foreground mt-1">
              {quota?.planTier ? quota.planTier.charAt(0).toUpperCase() + quota.planTier.slice(1) : 'Unknown'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-admin-muted-foreground">Available Templates</p>
            <p className="text-lg font-semibold text-admin-foreground mt-1">
              {quota?.availableTemplates?.length || 0} workflows
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-4 bg-admin-card border-admin-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-admin-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-admin-background border-admin-border text-admin-foreground"
          />
        </div>
      </Card>

      {/* Workflows Table */}
      <Card className="bg-admin-card border-admin-border">
        <Table>
          <TableHeader>
            <TableRow className="border-admin-border hover:bg-admin-muted/50">
              <TableHead className="text-admin-foreground">Workflow</TableHead>
              <TableHead className="text-admin-foreground">Status</TableHead>
              <TableHead className="text-admin-foreground">Executions</TableHead>
              <TableHead className="text-admin-foreground">Success Rate</TableHead>
              <TableHead className="text-admin-foreground">Last Executed</TableHead>
              <TableHead className="text-admin-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.map((workflow: BusinessWorkflow) => (
              <TableRow key={workflow.id} className="border-admin-border hover:bg-admin-muted/50">
                <TableCell>
                  <p className="font-medium text-admin-foreground">{workflow.templateName}</p>
                </TableCell>
                <TableCell>
                  {workflow.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="size-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-admin-muted-foreground">
                      <Pause className="size-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-admin-foreground">
                      {workflow.totalExecutions.toLocaleString()}
                    </p>
                    <p className="text-xs text-admin-muted-foreground">
                      {workflow.failedExecutions} failed
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800">
                    {workflow.successRate.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-admin-foreground">
                    {workflow.lastExecutedAt
                      ? new Date(workflow.lastExecutedAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                      disabled={updateWorkflow.isPending}
                    >
                      {updateWorkflow.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : workflow.isActive ? (
                        <Pause className="size-4" />
                      ) : (
                        <Play className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveWorkflow(workflow.id)}
                      disabled={removeWorkflow.isPending}
                    >
                      {removeWorkflow.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Workflow Dialog */}
      <AdminModal open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AdminModalContent size="md">
          <AdminModalHeader>
            <AdminModalTitle>Add Workflow</AdminModalTitle>
            <AdminModalDescription>
              Select a workflow template to add to this business
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalBody className="space-y-4">
            <p className="text-sm text-admin-muted-foreground">
              Available templates based on {quota?.planTier || 'current'} plan
            </p>
            <p className="text-sm text-orange-500">
              {quota?.availableTemplates?.length || 0} templates available
            </p>
            {/* TODO: Implement workflow template selection with real data */}
          </AdminModalBody>
          <AdminModalFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              Cancel
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled>
              Add Workflow
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}

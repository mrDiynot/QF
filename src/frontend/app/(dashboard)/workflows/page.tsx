'use client';

/**
 * Workflows Management Page
 * Lists all available workflows for the current subscription tier
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Plus,
  Search,
  BarChart3,
  Settings,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { AIWorkflowGenerationDialog } from '@/components/workflows/AIWorkflowGenerationDialog';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { getWorkflowsByTier, canCreateCustomWorkflows, hasWorkflowBuilderAccess } from '@/types/workflows';
import type { SubscriptionTier, WorkflowCategory, PrebuiltWorkflowId } from '@/types/workflows';
import { WorkflowLimitBanner } from '@/components/workflows/WorkflowLimitBanner';
import { WorkflowLimitIndicator } from '@/components/workflows/WorkflowLimitIndicator';
import { useWorkflowLimits } from '@/hooks/subscriptions/useWorkflowLimits';
import { useWorkflows } from '@/hooks/workflows/useWorkflows';

export default function WorkflowsPage() {
  const router = useRouter();
  const { currentPlan } = useFeatureAccess();
  const { data: workflowLimits } = useWorkflowLimits();
  const { data: workflows, isLoading, error } = useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<WorkflowCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const tier = currentPlan as SubscriptionTier || 'freeflow';
  const availableWorkflowIds = getWorkflowsByTier(tier);
  const canCreateCustom = canCreateCustomWorkflows(tier);
  const hasBuilder = hasWorkflowBuilderAccess(tier);
  const canCreateMore = workflowLimits?.canCreateMore ?? true;

  // Filter workflows
  const filteredWorkflows = (workflows || []).filter(workflow => {
    // Check if available in current tier
    if (!availableWorkflowIds.includes(workflow.id as PrebuiltWorkflowId)) return false;

    // Search filter
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && workflow.category !== categoryFilter) return false;

    // Status filter
    if (statusFilter === 'active' && !workflow.isActive) return false;
    if (statusFilter === 'inactive' && workflow.isActive) return false;

    return true;
  });

  const getCategoryBadgeColor = (category: WorkflowCategory) => {
    switch (category) {
      case 'lead_management':
        return 'bg-blue-100 text-blue-800';
      case 'follow_up_recovery':
        return 'bg-green-100 text-green-800';
      case 'engagement_retention':
        return 'bg-purple-100 text-purple-800';
      case 'sales_conversion':
        return 'bg-orange-100 text-orange-800';
      case 'communication':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <AlertCircle className="size-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load workflows</h2>
        <p className="text-text-secondary">{error instanceof Error ? error.message : 'An error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-navy">Workflows</h1>
          <p className="text-text-secondary mt-1">
            Automate your business processes with pre-built workflows
          </p>
          <WorkflowLimitIndicator className="mt-2" />
        </div>
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={() => setAiDialogOpen(true)}
            className="gap-2"
            disabled={!canCreateMore}
          >
            <Sparkles className="size-4" />
            Generate with AI
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/workflows/gallery')}
            className="gap-2"
          >
            <LayoutGrid className="size-4" />
            View Gallery
          </Button>
          {canCreateCustom && (
            <Button
              variant="outline"
              onClick={() => router.push('/workflows/custom')}
              className="gap-2"
              disabled={!canCreateMore}
            >
              <Plus className="size-4" />
              Custom Workflow
            </Button>
          )}
          {hasBuilder && (
            <Button
              onClick={() => router.push('/workflows/builder')}
              className="gap-2 gradient-primary text-white"
              disabled={!canCreateMore}
            >
              <Zap className="size-4" />
              Workflow Builder
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Limit Banner */}
      <WorkflowLimitBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Workflows</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {workflows?.filter(w => w.isActive).length || 0}
              </p>
            </div>
            <CheckCircle2 className="size-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Executions</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {workflows?.reduce((sum, w) => sum + (w.executions || 0), 0).toLocaleString() || '0'}
              </p>
            </div>
            <BarChart3 className="size-8 text-brand-purple" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Avg Success Rate</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {workflows && workflows.length > 0
                  ? Math.round(workflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / workflows.length)
                  : 0}%
              </p>
            </div>
            <Zap className="size-8 text-brand-orange" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Available</p>
              <p className="text-2xl font-bold text-text-navy mt-1">
                {workflows?.length || 0}
              </p>
            </div>
            <Clock className="size-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows..."
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={(value: typeof categoryFilter) => setCategoryFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lead_management">Lead Management</SelectItem>
              <SelectItem value="follow_up_recovery">Follow-Up & Recovery</SelectItem>
              <SelectItem value="engagement_retention">Engagement & Retention</SelectItem>
              <SelectItem value="sales_conversion">Sales & Conversion</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((workflow) => (
          <Card
            key={workflow.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/workflows/${workflow.id}`)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-navy mb-1">{workflow.name}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2">{workflow.description}</p>
                </div>
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

              {/* Category */}
              {workflow.category && (
                <Badge className={getCategoryBadgeColor(workflow.category)}>
                  {workflow.category.replace('_', ' ')}
                </Badge>
              )}

              {/* Stats */}
              {(workflow.executions ?? 0) > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-text-secondary">Executions</p>
                    <p className="text-sm font-medium text-text-navy">{workflow.executions?.toLocaleString() ?? '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Success</p>
                    <p className="text-sm font-medium text-text-navy">{workflow.successRate ?? 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Avg Time</p>
                    <p className="text-sm font-medium text-text-navy">{workflow.avgDuration}s</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant={workflow.isActive ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle workflow
                  }}
                >
                  {workflow.isActive ? (
                    <>
                      <Pause className="size-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="size-4 mr-1" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workflows/${workflow.id}/settings`);
                  }}
                >
                  <Settings className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="size-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-navy mb-2">No workflows found</h3>
          <p className="text-text-secondary mb-6">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Upgrade your plan to unlock more workflows'}
          </p>
          {!canCreateCustom && (
            <Button
              onClick={() => router.push('/settings/subscription')}
              className="gradient-primary text-white"
            >
              Upgrade Plan
            </Button>
          )}
        </Card>
      )}

      {/* Upgrade Banner */}
      {!hasBuilder && (
        <Card className="p-6 bg-gradient-to-r from-brand-purple/10 to-brand-orange/10 border-brand-purple/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-navy mb-1">
                Unlock Custom Workflows
              </h3>
              <p className="text-text-secondary">
                Upgrade to Enterprise to access the visual workflow builder and create unlimited custom workflows
              </p>
            </div>
            <Button
              onClick={() => router.push('/settings/subscription')}
              className="gradient-primary text-white"
            >
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}

      {/* AI Workflow Generation Dialog */}
      <AIWorkflowGenerationDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onWorkflowSaved={() => {
          // Refresh workflows list
          window.location.reload();
        }}
      />
    </div>
  );
}

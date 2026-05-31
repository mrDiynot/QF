'use client';

/**
 * Custom Workflows Page
 * Lists custom workflows and allows Enterprise users to create new ones
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Play,
  Pause,
  Settings,
  AlertCircle,
  Crown,
  Zap,
  ArrowLeft,
  Loader2,
  Lock,
} from 'lucide-react';
import { useFeatureAccess } from '@/hooks/subscriptions/useFeatureAccess';
import { canCreateCustomWorkflows, getMaxCustomWorkflows, hasWorkflowBuilderAccess } from '@/types/workflows';
import type { SubscriptionTier } from '@/types/workflows';
import { useWorkflows } from '@/hooks/workflows/useWorkflows';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

export default function CustomWorkflowsPage() {
  const router = useRouter();
  const { currentPlan } = useFeatureAccess();
  const { data: workflows, isLoading, error } = useWorkflows();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const tier = currentPlan as SubscriptionTier || 'freeflow';
  const canCreateCustom = canCreateCustomWorkflows(tier);
  const maxCustom = getMaxCustomWorkflows(tier);
  const hasBuilder = hasWorkflowBuilderAccess(tier);

  // Filter to only custom workflows (non-prebuilt)
  const customWorkflows = (workflows || []).filter(w => w.isCustom);
  
  const filteredWorkflows = customWorkflows.filter(workflow => {
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const customWorkflowCount = customWorkflows.length;
  const canCreateMore = maxCustom === Infinity || customWorkflowCount < maxCustom;

  const handleCreateWorkflow = () => {
    if (!canCreateCustom) {
      setShowUpgradePrompt(true);
      return;
    }
    if (!canCreateMore) {
      setShowUpgradePrompt(true);
      return;
    }
    router.push('/workflows/builder');
  };

  // Not allowed to access custom workflows
  if (!canCreateCustom) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Workflows
          </Button>
        </div>

        <Card className="p-12 text-center max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <Lock className="size-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-text-navy mb-3">
            Custom Workflows
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Create your own automated workflows with our visual builder. 
            Custom workflows are available on UltraFlow and Enterprise plans.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Crown className="size-4 text-purple-500" />
              <span>UltraFlow: Up to 5 custom workflows</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Crown className="size-4 text-amber-500" />
              <span>Enterprise: Unlimited custom workflows</span>
            </div>
          </div>
          <Button
            onClick={() => router.push('/settings/subscription')}
            className="gradient-primary text-white"
          >
            <Crown className="size-4 mr-2" />
            Upgrade to Unlock
          </Button>
        </Card>
      </div>
    );
  }

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
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/workflows')}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Workflows
          </Button>
        </div>

        <Card className="p-12 text-center">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-navy mb-2">
            Failed to load custom workflows
          </h3>
          <p className="text-text-secondary mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="outline" onClick={() => router.push('/workflows')}>
            Back to Workflows
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/workflows')}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Workflows
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-navy">Custom Workflows</h1>
          <p className="text-text-secondary mt-1">
            Create and manage your own automated workflows
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Badge variant="outline" className="gap-1">
            <Zap className="size-3" />
            {customWorkflowCount} / {maxCustom === Infinity ? '∞' : maxCustom}
          </Badge>
          {hasBuilder && (
            <Button
              onClick={handleCreateWorkflow}
              className="gap-2 gradient-primary text-white"
              disabled={!canCreateMore}
            >
              <Plus className="size-4" />
              Create Workflow
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {customWorkflows.length > 0 && (
        <Card className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search custom workflows..."
              className="pl-10"
            />
          </div>
        </Card>
      )}

      {/* Workflows Grid */}
      {filteredWorkflows.length > 0 ? (
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
                      <Play className="size-3 mr-1" />
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
                  <Badge variant="secondary">
                    {workflow.category.replace('_', ' ')}
                  </Badge>
                )}

                {/* Stats */}
                {(workflow.executions ?? 0) > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-text-secondary">Executions</p>
                      <p className="text-sm font-medium text-text-navy">
                        {workflow.executions?.toLocaleString() ?? '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Success Rate</p>
                      <p className="text-sm font-medium text-text-navy">
                        {workflow.successRate ?? 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/workflows/${workflow.id}/settings`);
                    }}
                  >
                    <Settings className="size-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-6">
            <Zap className="size-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-navy mb-2">
            {searchQuery ? 'No workflows found' : 'No custom workflows yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Create your first custom workflow to automate your business processes'}
          </p>
          {!searchQuery && hasBuilder && (
            <Button
              onClick={handleCreateWorkflow}
              className="gradient-primary text-white"
              disabled={!canCreateMore}
            >
              <Plus className="size-4 mr-2" />
              Create Your First Workflow
            </Button>
          )}
        </Card>
      )}

      {/* Limit Warning */}
      {!canCreateMore && maxCustom !== Infinity && (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-navy mb-1">
                Custom Workflow Limit Reached
              </h3>
              <p className="text-text-secondary">
                You&apos;ve reached the maximum of {maxCustom} custom workflows on your plan.
                Upgrade to Enterprise for unlimited custom workflows.
              </p>
            </div>
            <Button
              onClick={() => router.push('/settings/subscription')}
              className="gradient-primary text-white"
            >
              Upgrade Plan
            </Button>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt Dialog */}
      <UpgradePrompt
        showDialog={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Custom Workflows"
        reason={!canCreateCustom 
          ? "Custom workflows require UltraFlow or Enterprise plan" 
          : "You've reached the custom workflow limit on your current plan"}
        requiredPlan={!canCreateCustom ? "Ultra Flow" : "Enterprise"}
      />
    </div>
  );
}

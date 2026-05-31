'use client';

/**
 * Enhanced Workflow Template Browser
 * Gap Closure - Workflow UI Enhancement
 *
 * Features:
 * - Template gallery with categories
 * - Template preview with diagrams
 * - One-click activation
 * - Search and filter
 * - Template ratings
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Zap,
  Clock,
  Users,
  Star,
  Play,
  Eye,
  Copy,
  TrendingUp,
  AlertCircle,
  Lock,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { workflowsService } from '@/services/api/workflows.service';
import { apiClient } from '@/lib/axios';
import { useWorkflowSubscriptionStatus } from '@/hooks/api/useWorkflows';
import { VisualWorkflowBuilder, WorkflowPreviewMini } from './VisualWorkflowBuilder';
import { getWorkflowDefinition } from '@/lib/workflow-definitions';

interface WorkflowTemplate {
  id: string;
  workflowId: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  estimatedTime: string;
  popularity: number;
  rating: number;
  isActive: boolean;
  icon: string;
  tier: string;
}

// Transform API template to display format
function transformTemplate(apiTemplate: {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  stepCount: number;
  estimatedTimeMinutes: number;
  usageCount: number;
  rating: number;
  isActive: boolean;
  icon?: string;
}): WorkflowTemplate {
  // Convert minutes to readable time format
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} mins`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  };

  // Calculate popularity percentage from usage count (normalize to 0-100)
  const popularity = Math.min(Math.round((apiTemplate.usageCount / 100) * 100), 100);

  // Extract workflowId from the template ID or use a derived value
  const workflowId = apiTemplate.id;

  return {
    id: apiTemplate.id,
    workflowId,
    name: apiTemplate.name,
    description: apiTemplate.description,
    category: apiTemplate.category,
    steps: apiTemplate.stepCount,
    estimatedTime: formatTime(apiTemplate.estimatedTimeMinutes),
    popularity,
    rating: apiTemplate.rating,
    isActive: apiTemplate.isActive,
    icon: apiTemplate.icon || '⚡',
    tier: apiTemplate.tier || 'FreeFlow',
  };
}

export function EnhancedWorkflowBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const queryClient = useQueryClient();

  // Fetch workflow subscription status
  const { data: subscriptionStatus } = useWorkflowSubscriptionStatus();

  // Fetch workflow templates from API
  const { data: apiTemplates, isLoading, error } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => workflowsService.getTemplates(),
  });

  // Check if a workflow is available based on subscription
  const isWorkflowAvailable = (workflowId: string) => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.availableWorkflowIds.includes(workflowId);
  };

  // Check if user can execute workflows (not FreeFlow)
  const canExecuteWorkflows = subscriptionStatus?.currentTier !== 'FreeFlow';

  // Transform API data to display format
  const templates = useMemo(() => {
    return (apiTemplates || []).map(transformTemplate);
  }, [apiTemplates]);

  // Extract unique categories from templates
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(templates.map(t => t.category)));
    return ['All', ...uniqueCategories.sort()];
  }, [templates]);

  const activateWorkflowMutation = useMutation({
    mutationFn: async (request: { templateId: string }) => {
      const response = await apiClient.post('/Workflows/activate', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow activated successfully');
    },
    onError: () => {
      toast.error('Failed to activate workflow');
    },
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActivate = (templateId: string) => {
    activateWorkflowMutation.mutate({ templateId });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertCircle className="size-12 mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load templates</h3>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Workflow Templates</h2>
        <p className="text-sm text-muted-foreground">
          Choose from pre-built workflows to automate your lead management
        </p>
      </div>

      {/* Subscription Status Banner */}
      {subscriptionStatus && (
        <Card className={cn(
          "p-4 border-l-4",
          subscriptionStatus.currentTier === 'FreeFlow' && "border-l-muted-foreground/40 bg-muted/30",
          subscriptionStatus.currentTier === 'SmartFlow' && "border-l-primary/60 bg-primary/5",
          subscriptionStatus.currentTier === 'UltraFlow' && "border-l-primary bg-primary/10",
          subscriptionStatus.currentTier === 'Enterprise' && "border-l-brand-orange bg-brand-orange/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className={cn(
                "size-5",
                subscriptionStatus.currentTier === 'FreeFlow' && "text-muted-foreground/40",
                subscriptionStatus.currentTier === 'SmartFlow' && "text-primary/60",
                subscriptionStatus.currentTier === 'UltraFlow' && "text-primary",
                subscriptionStatus.currentTier === 'Enterprise' && "text-brand-orange"
              )} />
              <div>
                <p className="font-medium">
                  {subscriptionStatus.currentTier} Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus.availableWorkflowIds.length} workflows available
                  {subscriptionStatus.currentTier === 'FreeFlow' && ' (view only)'}
                  {' • '}{subscriptionStatus.activeWorkflowCount} active
                  {' • '}{subscriptionStatus.monthlyExecutions} executions this month
                </p>
              </div>
            </div>
            {subscriptionStatus.currentTier === 'FreeFlow' && (
              <Button size="sm" className="gap-2">
                <Crown className="size-4" />
                Upgrade to SmartFlow
              </Button>
            )}
            {subscriptionStatus.currentTier === 'SmartFlow' && (
              <Button size="sm" variant="outline" className="gap-2">
                <Crown className="size-4" />
                Upgrade to UltraFlow
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      {template.tier !== 'FreeFlow' && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            template.tier === 'SmartFlow' && "border-blue-500 text-info",
                            template.tier === 'UltraFlow' && "border-primary text-primary",
                            template.tier === 'Enterprise' && "border-amber-500 text-amber-600"
                          )}
                        >
                          <Crown className="size-3 mr-1" />
                          {template.tier}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {template.isActive && (
                    <Badge className="bg-green-500">Active</Badge>
                  )}
                  {!isWorkflowAvailable(template.workflowId) && !template.isActive && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Lock className="size-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>

              {/* Mini Workflow Preview */}
              {(() => {
                const workflowDef = getWorkflowDefinition(template.workflowId);
                if (workflowDef) {
                  return (
                    <div className="py-2">
                      <WorkflowPreviewMini workflow={workflowDef} />
                    </div>
                  );
                }
                return null;
              })()}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Zap className="size-3" />
                  <span>{template.steps} steps</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{template.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  <span>{template.popularity}%</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < Math.floor(template.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {template.rating.toFixed(1)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Eye className="size-4" />
                  Preview
                </Button>
                {isWorkflowAvailable(template.workflowId) || template.isActive ? (
                  <Button
                    onClick={() => handleActivate(template.id)}
                    disabled={template.isActive || activateWorkflowMutation.isPending || !canExecuteWorkflows}
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    {template.isActive ? (
                      <>
                        <TrendingUp className="size-4" />
                        Active
                      </>
                    ) : !canExecuteWorkflows ? (
                      <>
                        <Eye className="size-4" />
                        View Only
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Activate
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled
                  >
                    <Lock className="size-4" />
                    Upgrade to {template.tier}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedTemplate.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {selectedTemplate.category}
                      </Badge>
                      {selectedTemplate.tier !== 'FreeFlow' && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            selectedTemplate.tier === 'SmartFlow' && "border-blue-500 text-info",
                            selectedTemplate.tier === 'UltraFlow' && "border-primary text-primary",
                            selectedTemplate.tier === 'Enterprise' && "border-amber-500 text-amber-600"
                          )}
                        >
                          <Crown className="size-3 mr-1" />
                          {selectedTemplate.tier}
                        </Badge>
                      )}
                      {!isWorkflowAvailable(selectedTemplate.workflowId) && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="size-3 mr-1" />
                          Requires Upgrade
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>

              {/* Visual Workflow Builder */}
              {(() => {
                const workflowDef = getWorkflowDefinition(selectedTemplate.workflowId);
                if (workflowDef) {
                  return (
                    <VisualWorkflowBuilder 
                      workflow={workflowDef} 
                      isReadOnly={true}
                      compact={false}
                    />
                  );
                }
                
                // Fallback to simple display if definition not found
                return (
                  <>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Zap className="size-6 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{selectedTemplate.steps}</div>
                        <div className="text-xs text-muted-foreground">Steps</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Clock className="size-6 mx-auto mb-2 text-primary" />
                        <div className="font-semibold">{selectedTemplate.estimatedTime}</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Star className="size-6 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                        <div className="font-semibold">{selectedTemplate.rating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="flex gap-3">
                {isWorkflowAvailable(selectedTemplate.workflowId) || selectedTemplate.isActive ? (
                  <Button
                    onClick={() => {
                      handleActivate(selectedTemplate.id);
                      setSelectedTemplate(null);
                    }}
                    disabled={selectedTemplate.isActive || !canExecuteWorkflows}
                    className="flex-1 gap-2"
                  >
                    {selectedTemplate.isActive ? (
                      <>
                        <TrendingUp className="size-4" />
                        Already Active
                      </>
                    ) : !canExecuteWorkflows ? (
                      <>
                        <Eye className="size-4" />
                        View Only (Upgrade to Activate)
                      </>
                    ) : (
                      <>
                        <Play className="size-4" />
                        Activate Workflow
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    disabled
                  >
                    <Lock className="size-4" />
                    Upgrade to {selectedTemplate.tier} to Activate
                  </Button>
                )}
                <Button variant="outline" className="gap-2">
                  <Copy className="size-4" />
                  Duplicate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

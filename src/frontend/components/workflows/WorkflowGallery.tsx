'use client';

/**
 * Workflow Gallery
 * Displays all 10 prebuilt workflows in a gallery format
 * with visual workflow builders and tier filtering
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Crown,
  Clock,
  Zap,
  Play,
  GitBranch,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORKFLOW_DEFINITIONS, type WorkflowDefinition } from '@/lib/workflow-definitions';
import { VisualWorkflowBuilder, WorkflowPreviewMini } from './VisualWorkflowBuilder';
import { useWorkflowSubscriptionStatus } from '@/hooks/api/useWorkflows';

type ViewMode = 'grid' | 'list';
type TierFilter = 'all' | 'FreeFlow' | 'SmartFlow' | 'UltraFlow' | 'Enterprise';

const tierColors: Record<string, { border: string; text: string; bg: string }> = {
  FreeFlow: { border: 'border-border', text: 'text-muted-foreground', bg: 'bg-muted/20' },
  SmartFlow: { border: 'border-blue-300', text: 'text-info', bg: 'bg-muted/30' },
  UltraFlow: { border: 'border-purple-300', text: 'text-primary', bg: 'bg-primary/5' },
  Enterprise: { border: 'border-amber-300', text: 'text-amber-600', bg: 'bg-amber-50' },
};

export function WorkflowGallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  
  const { data: subscriptionStatus } = useWorkflowSubscriptionStatus();

  const filteredWorkflows = useMemo(() => {
    // Tier hierarchy for filtering (higher tiers include lower tier workflows)
    const tierOrder = ['FreeFlow', 'SmartFlow', 'UltraFlow', 'Enterprise'];
    const filterTierIndex = tierFilter === 'all' ? tierOrder.length : tierOrder.indexOf(tierFilter);
    
    return WORKFLOW_DEFINITIONS.filter(workflow => {
      const matchesSearch = 
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Show workflows available at the selected tier level (includes lower tiers)
      const workflowTierIndex = tierOrder.indexOf(workflow.tier);
      const matchesTier = tierFilter === 'all' || workflowTierIndex <= filterTierIndex;
      
      return matchesSearch && matchesTier;
    });
  }, [searchQuery, tierFilter]);

  const _categories = useMemo(() => {
    return Array.from(new Set(WORKFLOW_DEFINITIONS.map(w => w.category))).sort();
  }, []);

  const isWorkflowAvailable = (workflowId: string) => {
    if (!subscriptionStatus) return false;
    return subscriptionStatus.availableWorkflowIds.includes(workflowId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Gallery</h2>
          <p className="text-sm text-muted-foreground">
            Explore all {WORKFLOW_DEFINITIONS.length} prebuilt automation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as TierFilter)}>
          <TabsList>
            <TabsTrigger value="all">All Tiers</TabsTrigger>
            <TabsTrigger value="FreeFlow">FreeFlow</TabsTrigger>
            <TabsTrigger value="SmartFlow">SmartFlow</TabsTrigger>
            <TabsTrigger value="UltraFlow">UltraFlow</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          <span className="text-sm">
            <strong>{filteredWorkflows.length}</strong> workflows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Play className="size-4 text-info" />
          <span className="text-sm">
            <strong>{filteredWorkflows.reduce((acc, w) => acc + w.steps.filter(s => s.type === 'action').length, 0)}</strong> total actions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-primary" />
          <span className="text-sm">
            <strong>{filteredWorkflows.reduce((acc, w) => acc + w.steps.filter(s => s.type === 'condition').length, 0)}</strong> conditions
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-orange-500" />
          <span className="text-sm">
            <strong>{filteredWorkflows.reduce((acc, w) => acc + w.steps.filter(s => s.type === 'delay').length, 0)}</strong> delays
          </span>
        </div>
      </div>

      {/* Workflow Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map(workflow => {
            const colors = tierColors[workflow.tier];
            const isAvailable = isWorkflowAvailable(workflow.id);
            
            return (
              <Card
                key={workflow.id}
                className={cn(
                  "p-5 cursor-pointer hover:shadow-lg transition-all border-2",
                  colors.border,
                  !isAvailable && "opacity-75"
                )}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{workflow.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{workflow.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {workflow.category}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", colors.text)}>
                          <Crown className="size-3 mr-1" />
                          {workflow.tier}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {workflow.description}
                  </p>

                  {/* Mini Preview */}
                  <div className="py-2">
                    <WorkflowPreviewMini workflow={workflow} />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="size-3" />
                      {workflow.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {workflow.estimatedDuration}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkflows.map(workflow => {
            const colors = tierColors[workflow.tier];
            const isAvailable = isWorkflowAvailable(workflow.id);
            
            return (
              <Card
                key={workflow.id}
                className={cn(
                  "p-4 cursor-pointer hover:shadow-md transition-all border-l-4",
                  colors.border,
                  !isAvailable && "opacity-75"
                )}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{workflow.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <Badge variant="outline" className={cn("text-xs", colors.text)}>
                        {workflow.tier}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {workflow.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{workflow.steps.length} steps</span>
                    <span>{workflow.estimatedDuration}</span>
                  </div>
                  <WorkflowPreviewMini workflow={workflow} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setTierFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedWorkflow.icon}</div>
                <div>
                  <h2 className="text-xl font-bold">{selectedWorkflow.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{selectedWorkflow.category}</Badge>
                    <Badge 
                      variant="outline" 
                      className={tierColors[selectedWorkflow.tier].text}
                    >
                      <Crown className="size-3 mr-1" />
                      {selectedWorkflow.tier}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedWorkflow(null)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(90vh-120px)]">
              <div className="p-6">
                <VisualWorkflowBuilder
                  workflow={selectedWorkflow}
                  isReadOnly={true}
                  compact={false}
                />
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}

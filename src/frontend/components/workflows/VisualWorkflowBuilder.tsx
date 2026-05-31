'use client';

/**
 * Visual Workflow Builder
 * Displays workflow steps in a visual flow diagram
 * Shows triggers, actions, conditions, delays, and end points
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Play,
  Clock,
  GitBranch,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowDefinition, WorkflowStep, StepType } from '@/lib/workflow-definitions';

interface VisualWorkflowBuilderProps {
  workflow: WorkflowDefinition;
  isReadOnly?: boolean;
  showConfig?: boolean;
  compact?: boolean;
}

const stepTypeConfig: Record<StepType, { 
  icon: typeof Zap; 
  color: string; 
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  trigger: {
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Trigger',
  },
  action: {
    icon: Play,
    color: 'text-info',
    bgColor: 'bg-muted/30',
    borderColor: 'border-border',
    label: 'Action',
  },
  condition: {
    icon: GitBranch,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
    label: 'Condition',
  },
  delay: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Delay',
  },
  end: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'End',
  },
};

function WorkflowStepNode({ 
  step, 
  index,
  isLast,
  compact,
  showConfig,
}: { 
  step: WorkflowStep; 
  index: number;
  isLast: boolean;
  compact?: boolean;
  showConfig?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = stepTypeConfig[step.type];
  const Icon = config.icon;

  return (
    <div className="relative">
      {/* Step Node */}
      <div
        className={cn(
          "relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
          config.bgColor,
          config.borderColor,
          "hover:shadow-md cursor-pointer"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Step Number & Icon */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-center size-10 rounded-full",
          "bg-white shadow-sm border",
          config.borderColor
        )}>
          <span className="text-2xl">{step.icon}</span>
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              <Icon className="size-3 mr-1" />
              {config.label}
            </Badge>
            {!compact && (
              <span className="text-xs text-muted-foreground">Step {index + 1}</span>
            )}
          </div>
          <h4 className={cn("font-semibold mt-1", compact ? "text-sm" : "")}>
            {step.name}
          </h4>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {step.description}
            </p>
          )}

          {/* Condition Branches */}
          {step.branches && step.branches.length > 0 && (
            <div className="mt-3 space-y-2">
              {step.branches.map((branch, branchIndex) => (
                <div
                  key={branchIndex}
                  className="flex items-center gap-2 text-xs bg-white/60 rounded px-2 py-1"
                >
                  <GitBranch className="size-3 text-primary" />
                  <span className="text-muted-foreground">{branch.condition}</span>
                </div>
              ))}
            </div>
          )}

          {/* Expanded Config (for future editing) */}
          {isExpanded && showConfig && (
            <div className="mt-3 pt-3 border-t border-dashed">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Settings className="size-3" />
                <span>Configuration options would appear here</span>
              </div>
            </div>
          )}
        </div>

        {/* Expand Toggle */}
        {showConfig && (
          <Button variant="ghost" size="icon" className="size-6">
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* Connector Line */}
      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200" />
          <div className="absolute left-1/2 -translate-x-1/2 mt-3">
            <div className="size-2 rounded-full bg-muted" />
          </div>
        </div>
      )}
    </div>
  );
}

export function VisualWorkflowBuilder({
  workflow,
  isReadOnly = true,
  showConfig = false,
  compact = false,
}: VisualWorkflowBuilderProps) {
  return (
    <div className="space-y-4">
      {/* Workflow Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="text-3xl">{workflow.icon}</div>
        <div>
          <h3 className="font-semibold">{workflow.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {workflow.category}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                workflow.tier === 'SmartFlow' && "border-blue-500 text-info",
                workflow.tier === 'UltraFlow' && "border-primary text-primary",
                workflow.tier === 'Enterprise' && "border-amber-500 text-amber-600"
              )}
            >
              {workflow.tier}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {workflow.estimatedDuration}
            </span>
          </div>
        </div>
      </div>

      {/* Workflow Description */}
      {!compact && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="size-4 text-muted-foreground mt-0.5" />
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
        </div>
      )}

      {/* Workflow Steps */}
      <ScrollArea className={compact ? "h-[300px]" : "h-[500px]"}>
        <div className="space-y-0 pr-4">
          {workflow.steps.map((step, index) => (
            <WorkflowStepNode
              key={step.id}
              step={step}
              index={index}
              isLast={index === workflow.steps.length - 1}
              compact={compact}
              showConfig={showConfig}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="size-4 text-amber-500" />
            {workflow.steps.filter(s => s.type === 'trigger').length} trigger
          </span>
          <span className="flex items-center gap-1">
            <Play className="size-4 text-info" />
            {workflow.steps.filter(s => s.type === 'action').length} actions
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="size-4 text-primary" />
            {workflow.steps.filter(s => s.type === 'condition').length} conditions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-4 text-orange-500" />
            {workflow.steps.filter(s => s.type === 'delay').length} delays
          </span>
        </div>
        {isReadOnly && (
          <Badge variant="outline" className="text-xs">
            Read-only Preview
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Compact workflow preview for cards
 */
export function WorkflowPreviewMini({ workflow }: { workflow: WorkflowDefinition }) {
  const maxSteps = 5;
  const visibleSteps = workflow.steps.slice(0, maxSteps);
  const remainingSteps = workflow.steps.length - maxSteps;

  return (
    <div className="flex items-center gap-1">
      {visibleSteps.map((step, index) => {
        const config = stepTypeConfig[step.type];
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "size-8 rounded-full flex items-center justify-center text-sm",
                config.bgColor,
                "border",
                config.borderColor
              )}
              title={step.name}
            >
              {step.icon}
            </div>
            {index < visibleSteps.length - 1 && (
              <div className="w-4 h-0.5 bg-muted" />
            )}
          </div>
        );
      })}
      {remainingSteps > 0 && (
        <>
          <div className="w-4 h-0.5 bg-muted" />
          <div className="size-8 rounded-full flex items-center justify-center text-xs bg-muted/40 border border-border text-muted-foreground">
            +{remainingSteps}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

/**
 * Workflow Template Card Component
 * Displays a workflow template with preview and activation options
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Info } from 'lucide-react';
import type { WorkflowCategory, SubscriptionTier } from '@/types/workflows';

interface WorkflowTemplateCardProps {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  tier: SubscriptionTier;
  isActive: boolean;
  executions?: number;
  successRate?: number;
  estimatedSetupTime?: number;
  onActivate: (id: string) => void;
  onConfigure: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function WorkflowTemplateCard({
  id,
  name,
  description,
  category,
  tier,
  isActive,
  executions = 0,
  successRate = 0,
  estimatedSetupTime = 5,
  onActivate,
  onConfigure,
  onViewDetails,
}: WorkflowTemplateCardProps) {
  // Categories use neutral gray - no semantic meaning
  const getCategoryColor = () => {
    return 'bg-muted text-muted-foreground border-border';
  };

  // Tiers use subtle brand distinction
  const getTierColor = (t: SubscriptionTier) => {
    switch (t) {
      case 'ultraflow':
        return 'bg-primary/10 text-primary border-primary/20'; // Premium tier uses brand color
      case 'enterprise':
        return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'; // Enterprise uses orange accent
      default:
        return 'bg-muted text-muted-foreground border-border'; // Standard tiers use neutral
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-text-navy group-hover:text-brand-purple transition-colors">
              {name}
            </h3>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(id)}
            className="ml-2"
          >
            <Info className="size-4" />
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getCategoryColor()}>
            {category.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={getTierColor(tier)}>
            {tier}
          </Badge>
          {isActive && (
            <Badge variant="success">
              Active
            </Badge>
          )}
        </div>

        {/* Stats */}
        {executions > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-text-secondary">Executions</p>
              <p className="text-sm font-medium text-text-navy">{executions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Success Rate</p>
              <p className="text-sm font-medium text-text-navy">{successRate}%</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Setup Time</p>
              <p className="text-sm font-medium text-text-navy">{estimatedSetupTime} min</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={isActive ? "outline" : "default"}
            size="sm"
            className="flex-1"
            onClick={() => onActivate(id)}
          >
            <Play className="size-4 mr-1" />
            {isActive ? 'Pause' : 'Activate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(id)}
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

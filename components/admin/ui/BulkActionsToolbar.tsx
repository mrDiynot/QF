'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface BulkAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  disabled?: boolean;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  actions,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'sticky top-16 z-30 border-t border-b border-admin-border bg-admin-muted/50 backdrop-blur-sm px-6 py-3',
        'animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClearSelection}
            className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>
          <span className="text-sm font-medium text-admin-foreground">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'h-8',
                  action.variant === 'destructive'
                    ? 'bg-admin-error text-white hover:bg-admin-error/90'
                    : 'border-admin-border text-admin-foreground hover:bg-admin-muted'
                )}
              >
                {Icon && <Icon className="h-4 w-4 mr-1.5" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

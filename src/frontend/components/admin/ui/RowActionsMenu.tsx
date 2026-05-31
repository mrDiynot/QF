'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  separator?: boolean;
}

interface RowActionsMenuProps {
  actions: RowAction[];
  className?: string;
  align?: 'start' | 'end';
}

export function RowActionsMenu({
  actions,
  className,
  align = 'end',
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            'h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted',
            className
          )}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-48 bg-admin-card border-admin-border shadow-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isDestructive = action.variant === 'destructive';

          return (
            <div key={index}>
              {action.separator && index > 0 && (
                <DropdownMenuSeparator className="bg-admin-border" />
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                className={cn(
                  'cursor-pointer transition-colors duration-200',
                  isDestructive
                    ? 'text-admin-error focus:bg-admin-error/10 focus:text-admin-error'
                    : 'text-admin-foreground hover:bg-admin-muted focus:bg-admin-muted',
                  action.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                <span>{action.label}</span>
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

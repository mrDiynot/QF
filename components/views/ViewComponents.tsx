/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * List & Grid View Components
 * List views, grid layouts, and view toggles
 * Note: Uses <img> for dynamic external images
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutGrid,
  List,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// View Toggle
interface ViewToggleProps {
  view: 'list' | 'grid';
  onChange: (view: 'list' | 'grid') => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center border rounded-lg p-0.5", className)}>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2"
        onClick={() => onChange('list')}
      >
        <List className="size-4" />
      </Button>
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-7 px-2"
        onClick={() => onChange('grid')}
      >
        <LayoutGrid className="size-4" />
      </Button>
    </div>
  );
}

// List Item
interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: { src?: string; name: string };
  icon?: React.ReactNode;
  badge?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' };
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  draggable?: boolean;
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  description,
  avatar,
  icon,
  badge,
  metadata,
  actions,
  selected,
  selectable,
  onSelect,
  onClick,
  draggable,
  className,
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-muted/20 transition-colors",
        onClick && "cursor-pointer",
        selected && "bg-primary/5",
        className
      )}
      onClick={onClick}
    >
      {draggable && (
        <GripVertical className="size-4 text-muted-foreground/60 cursor-grab flex-shrink-0" />
      )}
      
      {selectable && (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect?.(!!checked)}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        />
      )}

      {avatar && (
        <Avatar className="size-10 flex-shrink-0">
          <AvatarImage src={avatar.src} />
          <AvatarFallback>
            {avatar.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}

      {icon && !avatar && (
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40 flex-shrink-0">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{title}</h4>
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="flex-shrink-0">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        {description && <p className="text-sm text-muted-foreground/60 truncate mt-1">{description}</p>}
      </div>

      {metadata && <div className="flex-shrink-0 text-sm text-muted-foreground">{metadata}</div>}

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}

      {onClick && !actions && (
        <ChevronRight className="size-4 text-muted-foreground/60 flex-shrink-0" />
      )}
    </div>
  );
}

// List View Container
interface ListViewProps {
  children: React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ListView({ children, emptyState, className }: ListViewProps) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;

  if (!hasChildren && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <Card className={cn("divide-y overflow-hidden", className)}>
      {children}
    </Card>
  );
}

// Grid Item
interface GridItemProps {
  title: string;
  subtitle?: string;
  image?: string;
  icon?: React.ReactNode;
  badge?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' };
  footer?: React.ReactNode;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export function GridItem({
  title,
  subtitle,
  image,
  icon,
  badge,
  footer,
  selected,
  selectable,
  onSelect,
  onClick,
  className,
}: GridItemProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-md transition-shadow relative",
        onClick && "cursor-pointer",
        selected && "ring-2 ring-purple-500",
        className
      )}
      onClick={onClick}
    >
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect?.(!!checked)}
            onClick={(e) => e.stopPropagation()}
            className="bg-white"
          />
        </div>
      )}

      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant={badge.variant || 'secondary'}>{badge.label}</Badge>
        </div>
      )}

      {image && (
        <div className="aspect-video bg-muted/40">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      {!image && icon && (
        <div className="aspect-video bg-muted/20 flex items-center justify-center">
          <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}

      <div className="p-4">
        <h4 className="font-medium text-foreground truncate">{title}</h4>
        {subtitle && <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>}
        {footer && <div className="mt-3 pt-3 border-t">{footer}</div>}
      </div>
    </Card>
  );
}

// Grid View Container
interface GridViewProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 6;
  emptyState?: React.ReactNode;
  className?: string;
}

export function GridView({
  children,
  columns = 3,
  gap = 4,
  emptyState,
  className,
}: GridViewProps) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;

  if (!hasChildren && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
  };

  return (
    <div className={cn(
      "grid",
      colClasses[columns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive Grid (auto-adjusts columns)
interface ResponsiveGridProps {
  children: React.ReactNode;
  minWidth?: number;
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  minWidth = 280,
  gap = 16,
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

// Masonry Grid (for varying heights)
interface MasonryGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function MasonryGrid({
  children,
  columns = 3,
  gap = 16,
  className,
}: MasonryGridProps) {
  return (
    <div
      className={className}
      style={{
        columnCount: columns,
        columnGap: `${gap}px`,
      }}
    >
      {Array.isArray(children) && children.map((child, index) => (
        <div key={index} style={{ breakInside: 'avoid', marginBottom: `${gap}px` }}>
          {child}
        </div>
      ))}
    </div>
  );
}

// Compact List Item
interface CompactListItemProps {
  title: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CompactListItem({ title, value, icon, onClick, className }: CompactListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        onClick && "cursor-pointer hover:bg-muted/20 -mx-2 px-2 rounded",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      {value && (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
}

// Selection Summary
interface SelectionSummaryProps {
  count: number;
  total: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function SelectionSummary({
  count,
  total,
  onSelectAll,
  onClearSelection,
  actions,
  className,
}: SelectionSummaryProps) {
  if (count === 0) return null;

  return (
    <div className={cn(
      "flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3",
      className
    )}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-primary">
          {count} of {total} selected
        </span>
        {onSelectAll && count < total && (
          <Button variant="link" size="sm" className="text-primary p-0 h-auto" onClick={onSelectAll}>
            Select all
          </Button>
        )}
        {onClearSelection && (
          <Button variant="link" size="sm" className="text-primary p-0 h-auto" onClick={onClearSelection}>
            Clear selection
          </Button>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Split View
interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  className?: string;
}

export function SplitView({ left, right, leftWidth = '300px', className }: SplitViewProps) {
  return (
    <div className={cn("flex h-full", className)}>
      <div className="border-r overflow-auto" style={{ width: leftWidth, flexShrink: 0 }}>
        {left}
      </div>
      <div className="flex-1 overflow-auto">
        {right}
      </div>
    </div>
  );
}

// Empty View State
interface EmptyViewStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyViewState({ icon, title, description, action, className }: EmptyViewStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && (
        <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center mb-4 text-muted-foreground/60">
          {icon}
        </div>
      )}
      <h3 className="font-medium text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4 bg-primary hover:bg-purple-700">
          {action.label}
        </Button>
      )}
    </div>
  );
}

'use client';

/**
 * Kanban & Board Components
 * Kanban columns, cards, and board views
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  Edit,
  Trash2,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Kanban Card Item
interface KanbanCardItem {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  assignee?: { name: string; avatar?: string };
  tags?: Array<{ id: string; label: string; color: string }>;
  commentsCount?: number;
  attachmentsCount?: number;
}

interface KanbanCardProps {
  item: KanbanCardItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  draggable?: boolean;
  className?: string;
}

const PRIORITY_COLORS = {
  low: 'bg-muted/40 text-muted-foreground',
  medium: 'bg-muted/50 text-info',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export function KanbanCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  draggable = true,
  className,
}: KanbanCardProps) {
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();

  return (
    <Card
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-shadow group",
        draggable && "cursor-grab active:cursor-grabbing",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {item.priority && (
            <Badge variant="secondary" className={cn("text-xs mb-2", PRIORITY_COLORS[item.priority])}>
              {item.priority}
            </Badge>
          )}
          <h4 className="font-medium text-foreground line-clamp-2">{item.title}</h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="size-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="size-4 mr-2" /> Duplicate
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600">
                <Trash2 className="size-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.label}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-muted-foreground/60">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center gap-3 text-muted-foreground/60">
          {item.dueDate && (
            <span className={cn("flex items-center gap-1 text-xs", isOverdue && "text-red-500")}>
              <Calendar className="size-3" />
              {format(item.dueDate, 'MMM d')}
            </span>
          )}
          {item.commentsCount !== undefined && item.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="size-3" />
              {item.commentsCount}
            </span>
          )}
          {item.attachmentsCount !== undefined && item.attachmentsCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="size-3" />
              {item.attachmentsCount}
            </span>
          )}
        </div>
        {item.assignee && (
          <Avatar className="size-6">
            <AvatarImage src={item.assignee.avatar} />
            <AvatarFallback className="text-[10px]">
              {item.assignee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}

// Kanban Column
interface KanbanColumnProps {
  id: string;
  title: string;
  items: KanbanCardItem[];
  color?: string;
  count?: number;
  onAddItem?: () => void;
  onItemClick?: (item: KanbanCardItem) => void;
  onItemEdit?: (item: KanbanCardItem) => void;
  onItemDelete?: (item: KanbanCardItem) => void;
  className?: string;
}

export function KanbanColumn({
  title,
  items,
  color = '#8b5cf6',
  count,
  onAddItem,
  onItemClick,
  onItemEdit,
  onItemDelete,
  className,
}: KanbanColumnProps) {
  return (
    <div className={cn("flex flex-col w-72 flex-shrink-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary" className="h-5 px-1.5">
            {count ?? items.length}
          </Badge>
        </div>
        {onAddItem && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onAddItem}>
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 min-h-[200px] p-2 bg-muted/20 rounded-lg">
        {items.map((item) => (
          <KanbanCard
            key={item.id}
            item={item}
            onClick={() => onItemClick?.(item)}
            onEdit={() => onItemEdit?.(item)}
            onDelete={() => onItemDelete?.(item)}
          />
        ))}
        {items.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground/60">
            No items
          </div>
        )}
      </div>
    </div>
  );
}

// Kanban Board
interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items: KanbanCardItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onAddItem?: (columnId: string) => void;
  onItemClick?: (item: KanbanCardItem, columnId: string) => void;
  onItemMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void;
  className?: string;
}

export function KanbanBoard({
  columns,
  onAddItem,
  onItemClick,
  className,
}: KanbanBoardProps) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          id={column.id}
          title={column.title}
          items={column.items}
          color={column.color}
          onAddItem={onAddItem ? () => onAddItem(column.id) : undefined}
          onItemClick={(item) => onItemClick?.(item, column.id)}
        />
      ))}
    </div>
  );
}

// Pipeline Stage Card
interface PipelineStageProps {
  title: string;
  count: number;
  value?: string;
  color?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PipelineStage({
  title,
  count,
  value,
  color = '#8b5cf6',
  isActive,
  onClick,
  className,
}: PipelineStageProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all",
        isActive ? "ring-2 ring-purple-500" : "hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
        <h4 className="font-medium text-foreground">{title}</h4>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-foreground">{count}</span>
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
      </div>
    </Card>
  );
}

// Pipeline View (horizontal stages)
interface PipelineStage {
  id: string;
  title: string;
  count: number;
  value?: string;
  color?: string;
}

interface PipelineViewProps {
  stages: PipelineStage[];
  activeStageId?: string;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

export function PipelineView({ stages, activeStageId, onStageClick, className }: PipelineViewProps) {
  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-2", className)}>
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          <PipelineStage
            title={stage.title}
            count={stage.count}
            value={stage.value}
            color={stage.color}
            isActive={stage.id === activeStageId}
            onClick={() => onStageClick?.(stage.id)}
          />
          {index < stages.length - 1 && (
            <ArrowRight className="size-5 text-muted-foreground/30 mx-2 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// Simple Task Card
interface TaskCardProps {
  title: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignee?: { name: string; avatar?: string };
  onClick?: () => void;
  onStatusChange?: (status: 'todo' | 'in_progress' | 'done') => void;
  className?: string;
}

export function TaskCard({
  title,
  status = 'todo',
  priority,
  dueDate,
  assignee,
  onClick,
  className,
}: TaskCardProps) {
  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-muted/40 text-muted-foreground' },
    in_progress: { label: 'In Progress', color: 'bg-muted/50 text-info' },
    done: { label: 'Done', color: 'bg-green-100 text-green-700' },
  };

  return (
    <Card
      className={cn("p-3 hover:shadow-md transition-shadow cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className={cn("text-xs", statusConfig[status].color)}>
              {statusConfig[status].label}
            </Badge>
            {priority && (
              <Badge variant="secondary" className={cn("text-xs", PRIORITY_COLORS[priority])}>
                {priority}
              </Badge>
            )}
          </div>
        </div>
        {assignee && (
          <Avatar className="size-7">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback className="text-xs">
              {assignee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
      {dueDate && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {format(dueDate, 'MMM d, yyyy')}
        </div>
      )}
    </Card>
  );
}

// Board Header
interface BoardHeaderProps {
  title: string;
  itemCount?: number;
  onAddItem?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function BoardHeader({ title, itemCount, onAddItem, actions, className }: BoardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {itemCount !== undefined && (
          <Badge variant="secondary">{itemCount} items</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onAddItem && (
          <Button onClick={onAddItem} className="gap-2 bg-primary hover:bg-purple-700">
            <Plus className="size-4" />
            Add Item
          </Button>
        )}
      </div>
    </div>
  );
}

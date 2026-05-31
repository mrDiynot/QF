'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingTable } from './LoadingTable';
import { AdminEmptyState } from './EmptyState';

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Column header label */
  label: string;
  /** Render function for the cell */
  render: (row: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T) => number;
  /** Column width class */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Hide column on mobile */
  hideOnMobile?: boolean;
  /** Header className */
  headerClassName?: string;
  /** Cell className */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /** Array of data items */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Unique key extractor (preferred) */
  getRowKey?: (row: T) => string | number;
  /** Alias for getRowKey */
  getRowId?: (row: T) => string | number;
  /** Loading state */
  loading?: boolean;
  /** Empty state component */
  emptyState?: React.ReactNode;
  /** Empty state title shorthand */
  emptyMessage?: string;
  /** Empty state description shorthand */
  emptyDescription?: string;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedRows?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Custom row className */
  rowClassName?: string | ((row: T) => string);
  /** Sort configuration */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort change handler */
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  /** Table className */
  className?: string;
  /** Enable hover effect on rows */
  hoverEffect?: boolean;
  /** Compact mode */
  compact?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  getRowId,
  loading = false,
  emptyState,
  emptyMessage,
  emptyDescription,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  onRowClick,
  rowClassName,
  sortBy,
  sortDirection = 'asc',
  onSortChange,
  className,
  hoverEffect = true,
  compact = false,
}: DataTableProps<T>) {
  // Resolve getRowKey from either prop (fallback uses index)
  const resolvedGetRowKey = React.useMemo(
    () => getRowKey || getRowId || ((_row: T) => 0),
    [getRowKey, getRowId]
  );
  // Select all handler
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;

      if (checked) {
        const allKeys = new Set(data.map(resolvedGetRowKey));
        onSelectionChange(allKeys);
      } else {
        onSelectionChange(new Set());
      }
    },
    [data, resolvedGetRowKey, onSelectionChange]
  );

  // Individual row selection handler
  const handleRowSelection = React.useCallback(
    (rowKey: string | number, checked: boolean) => {
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedRows);
      if (checked) {
        newSelection.add(rowKey);
      } else {
        newSelection.delete(rowKey);
      }
      onSelectionChange(newSelection);
    },
    [selectedRows, onSelectionChange]
  );

  // Sort handler
  const handleSort = React.useCallback(
    (columnKey: string) => {
      if (!onSortChange) return;

      const newDirection =
        sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(columnKey, newDirection);
    },
    [sortBy, sortDirection, onSortChange]
  );

  // Check if all rows are selected
  const allSelected = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  // Loading state
  if (loading) {
    return (
      <LoadingTable
        rows={10}
        columns={columns.length + (selectable ? 1 : 0)}
        className={className}
      />
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      emptyState || (
        <AdminEmptyState
          title={emptyMessage || "No data"}
          description={emptyDescription || "There are no items to display"}
          className="py-12"
        />
      )
    );
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-admin-border hover:bg-transparent">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                  className="border-admin-border data-[state=checked]:bg-admin-primary data-[state=checked]:border-admin-primary"
                  {...(someSelected && { 'data-indeterminate': 'true' })}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'text-admin-muted-foreground font-medium',
                  column.hideOnMobile && 'hidden md:table-cell',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.width,
                  compact && 'py-2',
                  column.headerClassName
                )}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(column.key)}
                    className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-admin-muted text-admin-muted-foreground hover:text-admin-foreground"
                  >
                    <span>{column.label}</span>
                    {sortBy === column.key ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => {
            const rowKey = (getRowKey || getRowId) ? resolvedGetRowKey(row) : idx;
            const isSelected = selectedRows.has(rowKey);
            const customRowClass = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName;

            return (
              <TableRow
                key={rowKey}
                data-state={isSelected && 'selected'}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-admin-border transition-colors duration-200',
                  hoverEffect && 'hover:bg-admin-muted/50',
                  isSelected && 'bg-admin-muted/30',
                  onRowClick && 'cursor-pointer',
                  customRowClass
                )}
              >
                {selectable && (
                  <TableCell className={cn('w-12', compact && 'py-2')}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleRowSelection(rowKey, checked as boolean)
                      }
                      aria-label={`Select row ${rowKey}`}
                      onClick={(e) => e.stopPropagation()}
                      className="border-admin-border data-[state=checked]:bg-admin-primary data-[state=checked]:border-admin-primary"
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      'text-admin-foreground',
                      column.hideOnMobile && 'hidden md:table-cell',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      compact && 'py-2',
                      column.cellClassName
                    )}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Pencil,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AdminModal,
  AdminModalContent,
  AdminModalHeader,
  AdminModalFooter,
  AdminModalTitle,
  AdminModalDescription,
} from './AdminModal';

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface AdminDataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string | null;
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  // Actions
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  addLabel?: string;
  // Delete confirmation
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string | ((item: T) => string);
  deletePending?: boolean;
  // Styling
  className?: string;
  emptyMessage?: string;
  // Custom row actions
  renderActions?: (item: T) => React.ReactNode;
}

// ============================================================================
// ADMIN DATA GRID COMPONENT
// ============================================================================

export function AdminDataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  error = null,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  onEdit,
  onDelete,
  onAdd,
  addLabel = 'Add New',
  deleteConfirmTitle = 'Delete Item',
  deleteConfirmDescription = 'Are you sure you want to delete this item? This action cannot be undone.',
  deletePending = false,
  className,
  emptyMessage = 'No data found.',
  renderActions,
}: AdminDataGridProps<T>) {
  // State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [deleteItem, setDeleteItem] = React.useState<T | null>(null);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      })
    );
  }, [data, searchQuery, searchKeys]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset to page 1 when page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem);
      setDeleteItem(null);
    }
  };

  // Compute delete description
  const computedDeleteDescription: string = React.useMemo(() => {
    if (typeof deleteConfirmDescription === 'function' && deleteItem) {
      return deleteConfirmDescription(deleteItem);
    }
    return typeof deleteConfirmDescription === 'string' 
      ? deleteConfirmDescription 
      : 'Are you sure you want to delete this item?';
  }, [deleteConfirmDescription, deleteItem]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-64 bg-admin-muted" />
          <Skeleton className="h-10 w-32 bg-admin-muted" />
        </div>
        <div className="rounded-lg border border-admin-border">
          <Skeleton className="h-12 w-full bg-admin-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-admin-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center', className)}>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header: Search + Add Button */}
      <div className="flex items-center justify-between gap-4">
        {searchable ? (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 bg-admin-background border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground"
            />
          </div>
        ) : (
          <div />
        )}
        {onAdd && (
          <Button onClick={onAdd} className="bg-[#FF6900] hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-admin-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-admin-border hover:bg-transparent bg-admin-muted/30">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'text-admin-muted-foreground font-medium',
                    column.width && `w-[${column.width}]`,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete || renderActions) && (
                <TableHead className="text-admin-muted-foreground text-right w-[100px]">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete || renderActions ? 1 : 0)}
                  className="h-32 text-center text-admin-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={keyExtractor(item)}
                  className="border-admin-border hover:bg-admin-muted/50"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        'text-admin-foreground',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render
                        ? column.render(item, startIndex + index)
                        : (item[column.key] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || renderActions) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {renderActions ? (
                          renderActions(item)
                        ) : (
                          <>
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(item)}
                                className="h-8 w-8 text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteItem(item)}
                                className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-admin-muted-foreground">
            <span>
              Showing {startIndex + 1} to {endIndex} of {totalItems} items
            </span>
            <span className="text-admin-border">|</span>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[70px] h-8 bg-admin-background border-admin-border text-admin-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-admin-card border-admin-border">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-admin-border text-admin-foreground hover:bg-admin-muted disabled:opacity-50"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 border-admin-border text-admin-foreground hover:bg-admin-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm text-admin-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 border-admin-border text-admin-foreground hover:bg-admin-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 border-admin-border text-admin-foreground hover:bg-admin-muted disabled:opacity-50"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminModal open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AdminModalContent size="sm">
          <AdminModalHeader>
            <AdminModalTitle>{deleteConfirmTitle}</AdminModalTitle>
            <AdminModalDescription>
              {computedDeleteDescription}
            </AdminModalDescription>
          </AdminModalHeader>
          <AdminModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteItem(null)}
              disabled={deletePending}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deletePending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletePending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </AdminModalFooter>
        </AdminModalContent>
      </AdminModal>
    </div>
  );
}

export default AdminDataGrid;

'use client';

/**
 * Data Table Component
 * Reusable table with sorting, filtering, and pagination
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Column definition
interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

// Sort state
type SortDirection = 'asc' | 'desc' | null;
interface SortState {
  key: string;
  direction: SortDirection;
}

// Pagination state
interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable = false,
  onSelectionChange,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = 'No data found',
  loading = false,
  onRowClick,
  rowClassName,
  className,
}: DataTableProps<T>) {
  // State
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ key: '', direction: null });
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [paginationState, setPaginationState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: data.length,
  });

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const value = getNestedValue(row, col.key as string);
        return String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [data, search, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sort.key) as string | number;
      const bVal = getNestedValue(b, sort.key) as string | number;
      const modifier = sort.direction === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * modifier;
      if (aVal > bVal) return 1 * modifier;
      return 0;
    });
  }, [filteredData, sort]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (paginationState.page - 1) * paginationState.pageSize;
    return sortedData.slice(start, start + paginationState.pageSize);
  }, [sortedData, pagination, paginationState]);

  // Total pages
  const totalPages = Math.ceil(sortedData.length / paginationState.pageSize);

  // Handle sort
  const handleSort = (key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key
        ? prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        : 'asc',
    }));
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(row => row.id));
      setSelected(allIds);
      onSelectionChange?.(paginatedData);
    } else {
      setSelected(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelected(newSelected);
    onSelectionChange?.(data.filter(row => newSelected.has(row.id)));
  };

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sort.key !== key) return <ArrowUpDown className="size-4 text-muted-foreground/60" />;
    if (sort.direction === 'asc') return <ArrowUp className="size-4" />;
    if (sort.direction === 'desc') return <ArrowDown className="size-4" />;
    return <ArrowUpDown className="size-4 text-muted-foreground/60" />;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Toolbar */}
      {(searchable || selectable) && (
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-2 flex-1">
            {searchable && (
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                    onClick={() => setSearch('')}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selected.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => { setSelected(new Set()); onSelectionChange?.([]); }}>
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={paginatedData.length > 0 && paginatedData.every(row => selected.has(row.id))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(col.width && `w-[${col.width}]`, col.className)}
                >
                  {col.sortable ? (
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => handleSort(String(col.key))}
                    >
                      {col.header}
                      {renderSortIcon(String(col.key))}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && <TableCell><div className="h-4 w-4 bg-muted rounded animate-pulse" /></TableCell>}
                  {columns.map((col, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/20",
                    rowClassName?.(row)
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render
                        ? col.render(getNestedValue(row, String(col.key)), row)
                        : String(getNestedValue(row, String(col.key)) ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing</span>
            <Select
              value={String(paginationState.pageSize)}
              onValueChange={(v) => setPaginationState(prev => ({ ...prev, pageSize: Number(v), page: 1 }))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>of {sortedData.length} results</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={paginationState.page === 1}
              onClick={() => setPaginationState(prev => ({ ...prev, page: 1 }))}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={paginationState.page === 1}
              onClick={() => setPaginationState(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {paginationState.page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={paginationState.page >= totalPages}
              onClick={() => setPaginationState(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={paginationState.page >= totalPages}
              onClick={() => setPaginationState(prev => ({ ...prev, page: totalPages }))}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Utility: Get nested object value
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

// Standalone Pagination Component
interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {onPageSizeChange && (
          <>
            <span>Show</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        <span>{total} total</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="size-8" disabled={page === 1} onClick={() => onPageChange(1)}>
          <ChevronsLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="size-8" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-3 text-sm">{page} / {totalPages || 1}</span>
        <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="outline" size="icon" className="size-8" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)}>
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

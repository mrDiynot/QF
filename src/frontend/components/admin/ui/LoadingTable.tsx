'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function LoadingTable({
  rows = 10,
  columns = 6,
  showHeader = true,
  className,
}: LoadingTableProps) {
  return (
    <div className={cn('w-full', className)}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow className="border-admin-border hover:bg-transparent">
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="h-12">
                  <Skeleton className="h-4 w-24 bg-admin-muted" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="border-admin-border hover:bg-transparent">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex} className="h-16">
                  <Skeleton
                    className={cn(
                      'h-4 bg-admin-muted',
                      colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-16 ml-auto' : 'w-24'
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

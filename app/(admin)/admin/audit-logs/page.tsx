'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingTable } from '@/components/admin/ui/LoadingTable';
import { AdminEmptyState } from '@/components/admin/ui/EmptyState';
import { useAdminAuditLogs, useExportAuditLogs } from '@/hooks/admin';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader, FilterBar, Pagination } from '@/components/admin/ui';

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Use React Query hooks for real data
  const { data, isLoading: loading, isError, refetch, isRefetching: refreshing } = useAdminAuditLogs({
    action: search || undefined,
    entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
    page,
    pageSize,
  });
  const exportMutation = useExportAuditLogs();

  // Extract data from response
  const logs = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleExport = () => {
    exportMutation.mutate({
      action: search || undefined,
      entityType: entityTypeFilter !== 'all' ? entityTypeFilter : undefined,
    });
  };

  const getActionBadge = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{action}</Badge>;
    }
    if (action.includes('delete') || action.includes('remove') || action.includes('suspend')) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{action}</Badge>;
    }
    if (action.includes('update') || action.includes('change') || action.includes('reset')) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{action}</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{action}</Badge>;
  };

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-400';
    if (code >= 400 && code < 500) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all admin actions and system events"
        isError={isError}
        onRefresh={() => refetch()}
        isRefreshing={refreshing}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-admin-border text-admin-foreground hover:bg-admin-muted"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by action or user..."
        filters={[
          {
            key: 'entityType',
            label: 'Entity Type',
            value: entityTypeFilter,
            onChange: setEntityTypeFilter,
            options: [
              { value: 'all', label: 'All Entities' },
              { value: 'admin', label: 'Admin' },
              { value: 'Business', label: 'Business' },
              { value: 'User', label: 'User' },
              { value: 'Subscription', label: 'Subscription' },
              { value: 'SupportTicket', label: 'Support Ticket' },
              { value: 'coming-soon-analytics', label: 'Coming Soon Analytics' },
              { value: 'cms', label: 'CMS' },
              { value: 'admin-users', label: 'Admin Users' },
              { value: 'workflow-templates', label: 'Workflow Templates' },
            ],
          },
        ]}
      />

      {/* Logs Table — custom rendering for expandable rows */}
      {loading ? (
        <LoadingTable rows={10} columns={7} />
      ) : logs.length === 0 ? (
        <AdminEmptyState
          title="No audit logs found"
          description="Audit logs will appear here as admin actions occur"
          className="py-12"
        />
      ) : (
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-admin-border hover:bg-transparent">
                <TableHead className="w-8" />
                <TableHead className="text-admin-muted-foreground">Action</TableHead>
                <TableHead className="text-admin-muted-foreground">Admin</TableHead>
                <TableHead className="text-admin-muted-foreground">Request</TableHead>
                <TableHead className="text-admin-muted-foreground">Entity</TableHead>
                <TableHead className="text-admin-muted-foreground">Status</TableHead>
                <TableHead className="text-admin-muted-foreground text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const isExpanded = expandedRows.has(log.id);
                const hasDetails = log.oldValues || log.newValues || log.errorMessage || log.userAgent;
                return (
                  <React.Fragment key={log.id}>
                    <TableRow
                      className="border-admin-border hover:bg-admin-muted/50 cursor-pointer"
                      onClick={() => hasDetails && toggleRow(log.id)}
                    >
                      <TableCell className="w-8 px-2">
                        {hasDetails && (
                          isExpanded
                            ? <ChevronDown className="h-4 w-4 text-admin-muted-foreground" />
                            : <ChevronRight className="h-4 w-4 text-admin-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-admin-foreground">{log.adminUserEmail}</TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          <span className="text-admin-foreground font-semibold">{log.httpMethod}</span>{' '}
                          <span className="text-admin-muted-foreground">{log.requestPath}</span>
                        </div>
                        <span className={`text-xs font-mono ${getStatusCodeColor(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-admin-foreground">{log.entityType}</p>
                          <p className="text-xs text-admin-muted-foreground font-mono">{log.entityId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />Success
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" />Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-admin-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasDetails && (
                      <TableRow className="border-admin-border bg-admin-muted/20">
                        <TableCell colSpan={7} className="py-3 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {log.errorMessage && (
                              <div className="md:col-span-2">
                                <p className="text-xs font-medium text-red-400 mb-1">Error Message</p>
                                <p className="text-admin-foreground bg-red-500/10 rounded p-2 text-xs font-mono">{log.errorMessage}</p>
                              </div>
                            )}
                            {log.oldValues && (
                              <div>
                                <p className="text-xs font-medium text-admin-muted-foreground mb-1">Old Values</p>
                                <pre className="text-xs font-mono text-admin-foreground bg-admin-muted rounded p-2 overflow-auto max-h-40">
                                  {typeof log.oldValues === 'string' ? log.oldValues : JSON.stringify(log.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.newValues && (
                              <div>
                                <p className="text-xs font-medium text-admin-muted-foreground mb-1">New Values</p>
                                <pre className="text-xs font-mono text-admin-foreground bg-admin-muted rounded p-2 overflow-auto max-h-40">
                                  {typeof log.newValues === 'string' ? log.newValues : JSON.stringify(log.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.userAgent && (
                              <div className="md:col-span-2">
                                <p className="text-xs font-medium text-admin-muted-foreground mb-1">User Agent</p>
                                <p className="text-xs font-mono text-admin-muted-foreground truncate">{log.userAgent}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-medium text-admin-muted-foreground mb-1">IP Address</p>
                              <p className="text-xs font-mono text-admin-foreground">{log.ipAddress}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalTitle,
} from '@/components/modals';
import {
  History,
  Download,
  Search,
  Filter,
  Loader2,
  Eye,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { teamService, AuditLog } from '@/services/api/team.service';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { Shield } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  Create: 'bg-green-100 text-green-800',
  Update: 'bg-blue-100 text-blue-800',
  Delete: 'bg-red-100 text-red-800',
  Login: 'bg-purple-100 text-purple-800',
  Logout: 'bg-gray-100 text-gray-800',
  LoginFailed: 'bg-orange-100 text-orange-800',
};

const ENTITY_TYPES = [
  'All',
  'Lead',
  'Conversation',
  'Message',
  'Form',
  'Channel',
  'User',
  'Authentication',
];

const ACTIONS = ['All', 'Create', 'Update', 'Delete', 'Login', 'Logout', 'LoginFailed'];

export default function AuditLogsPage() {
  const { isAdminOrOwner } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', entityTypeFilter, actionFilter, page],
    queryFn: () =>
      teamService.getAuditLogs({
        entityType: entityTypeFilter !== 'All' ? entityTypeFilter : undefined,
        action: actionFilter !== 'All' ? actionFilter : undefined,
        page,
        pageSize: 20,
      }),
  });

  const handleExport = async () => {
    try {
      const blob = await teamService.exportAuditLogs({
        entityType: entityTypeFilter !== 'All' ? entityTypeFilter : undefined,
        action: actionFilter !== 'All' ? actionFilter : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Audit logs exported successfully');
    } catch {
      toast.error('Failed to export audit logs');
    }
  };

  const filteredLogs = auditLogs?.items.filter((log) =>
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Permission check - only Admins and Owners can view audit logs
  if (!isAdminOrOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-full bg-red-100">
          <Shield className="size-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 text-center max-w-md">
          Only business owners and admins can view audit logs. Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-navy flex items-center gap-2">
            <History className="size-6" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all activities and changes in your business account
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by user or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="size-4 mr-2" />
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No audit logs found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-gray-400" />
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.username}</TableCell>
                    <TableCell>
                      <Badge className={ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entityId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-gray-500">{log.ipAddress || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {auditLogs && auditLogs.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-gray-500">
                  Page {page} of {auditLogs.totalPages} ({auditLogs.totalItems} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= auditLogs.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Audit Log Details</ModalTitle>
          </ModalHeader>
          {selectedLog && (
            <ModalBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedLog.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Action</p>
                  <Badge className={ACTION_COLORS[selectedLog.action] || 'bg-gray-100'}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entity Type</p>
                  <p className="font-medium">{selectedLog.entityType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entity ID</p>
                  <p className="font-mono text-sm">{selectedLog.entityId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Address</p>
                  <p className="font-medium">{selectedLog.ipAddress || '-'}</p>
                </div>
              </div>

              {selectedLog.oldValues && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Previous Values</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">New Values</p>
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">User Agent</p>
                  <p className="text-xs text-gray-600 break-all">{selectedLog.userAgent}</p>
                </div>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}


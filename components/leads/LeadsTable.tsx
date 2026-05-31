'use client';

import { useState } from 'react';
import { useLeads } from '@/hooks/api';
import { useBulkDeleteLeads, useBulkUpdateLeadStatus } from '@/hooks/api/useBulkOperations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/modals';
import {
  ChevronDown,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  New: 'bg-muted/50 text-info',
  Contacted: 'bg-yellow-100 text-yellow-800',
  Qualified: 'bg-green-100 text-green-800',
  Unqualified: 'bg-red-100 text-red-800',
  Converted: 'bg-primary/10 text-primary',
};

const statusIcons: Record<string, React.ReactNode> = {
  New: <Clock className="size-3" />,
  Contacted: <Mail className="size-3" />,
  Qualified: <CheckCircle className="size-3" />,
  Unqualified: <XCircle className="size-3" />,
  Converted: <CheckCircle className="size-3" />,
};

export function LeadsTable() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');

  const { data: leadsData, isLoading, refetch } = useLeads({ 
    pageNumber: page, 
    pageSize: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const bulkDelete = useBulkDeleteLeads();
  const bulkUpdateStatus = useBulkUpdateLeadStatus();

  const leads = leadsData?.items ?? [];
  const totalPages = leadsData?.totalPages ?? 1;

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDelete.mutateAsync(Array.from(selectedIds));
      toast.success(`Deleted ${result.successCount} leads`);
      if (result.failureCount > 0) {
        toast.error(`Failed to delete ${result.failureCount} leads`);
      }
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
    } catch {
      toast.error('Failed to delete leads');
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    setTargetStatus(status);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    try {
      const result = await bulkUpdateStatus.mutateAsync({
        ids: Array.from(selectedIds),
        status: targetStatus,
      });
      toast.success(`Updated ${result.successCount} leads to ${targetStatus}`);
      if (result.failureCount > 0) {
        toast.error(`Failed to update ${result.failureCount} leads`);
      }
      setSelectedIds(new Set());
      setShowStatusDialog(false);
    } catch {
      toast.error('Failed to update lead status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="overflow-hidden">
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="size-4" />
                  Change Status
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkStatusChange('New')}>
                  Mark as New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('Contacted')}>
                  Mark as Contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('Qualified')}>
                  Mark as Qualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('Unqualified')}>
                  Mark as Unqualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('Converted')}>
                  Mark as Converted
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Unqualified">Unqualified</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20 text-left text-sm font-medium text-muted-foreground">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  // @ts-expect-error - indeterminate is valid but not in types
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Created</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={cn(
                    'hover:bg-muted/20',
                    selectedIds.has(lead.id) && 'bg-muted/30'
                  )}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={() => handleSelectOne(lead.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{lead.firstName} {lead.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn('gap-1', statusColors[lead.status] || 'bg-muted/40 text-foreground/90')}>
                      {statusIcons[lead.status]}
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('font-semibold', getScoreColor(lead.score ?? 0))}>
                      {lead.score ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Delete ${selectedIds.size} Lead${selectedIds.size > 1 ? 's' : ''}?`}
        description="This action cannot be undone. This will permanently delete the selected leads and remove all associated data."
        variant="danger"
        confirmLabel={bulkDelete.isPending ? 'Deleting...' : 'Delete'}
        loading={bulkDelete.isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmModal
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={`Update Status to "${targetStatus}"?`}
        description={`This will update the status of ${selectedIds.size} lead${selectedIds.size > 1 ? 's' : ''} to "${targetStatus}".`}
        variant="info"
        confirmLabel={bulkUpdateStatus.isPending ? 'Updating...' : 'Update Status'}
        loading={bulkUpdateStatus.isPending}
        onConfirm={confirmStatusChange}
        onCancel={() => setShowStatusDialog(false)}
      />
    </Card>
  );
}

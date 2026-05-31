'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ExternalLink, Download, Trash2 } from 'lucide-react';
import { useAdminBusinesses } from '@/hooks/admin';
import {
  DataTable,
  type DataTableColumn,
  Pagination,
  PageHeader,
  FilterBar,
  BusinessStatusBadge,
  BulkActionsToolbar,
  RowActionsMenu,
  type RowAction,
} from '@/components/admin/ui';
import { AdminEmptyState } from '@/components/admin/ui/EmptyState';
import { toast } from 'sonner';
import type { AdminBusinessListItem } from '@/types/admin';

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use the React Query hook for real data
  const { data, isLoading, isError, refetch, isRefetching } = useAdminBusinesses({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize,
  });

  // Extract data from response
  const businesses = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Define table columns
  const columns: DataTableColumn<AdminBusinessListItem>[] = useMemo(
    () => [
      {
        key: 'business',
        label: 'Business',
        sortable: true,
        width: 'min-w-[250px]',
        render: (business) => (
          <div>
            <p className="font-medium text-admin-foreground">{business.name}</p>
            <p className="text-sm text-admin-muted-foreground">{business.email}</p>
          </div>
        ),
      },
      {
        key: 'planName',
        label: 'Plan',
        sortable: true,
        render: (business) => (
          <span className="text-admin-foreground">{business.planName}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (business) => <BusinessStatusBadge status={business.status} />,
      },
      {
        key: 'userCount',
        label: 'Users',
        sortable: true,
        align: 'center',
        render: (business) => (
          <div className="flex items-center justify-center gap-1 text-admin-foreground">
            <Users className="h-4 w-4 text-admin-muted-foreground" />
            <span>{business.userCount}</span>
          </div>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        hideOnMobile: true,
        render: (business) => (
          <span className="text-admin-muted-foreground">
            {formatDate(business.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        render: (business) => {
          const actions: RowAction[] = [
            {
              label: 'View Details',
              icon: ExternalLink,
              onClick: () => {
                // Navigate to business details
                window.location.href = `/admin/businesses/${business.id}`;
              },
            },
            {
              label: 'Manage Users',
              icon: Users,
              onClick: () => {
                window.location.href = `/admin/businesses/${business.id}?tab=users`;
              },
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: () => {
                toast.error('Business deletion is not yet supported');
              },
              variant: 'destructive',
              separator: true,
            },
          ];

          return <RowActionsMenu actions={actions} />;
        },
      },
    ],
    []
  );

  // Bulk actions
  const bulkActions = [
    {
      label: 'Export',
      icon: Download,
      onClick: () => {
        toast.info('Export functionality coming soon');
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        toast.error('Bulk deletion is not yet supported');
      },
      variant: 'destructive' as const,
    },
  ];

  // Filter configuration
  const filters = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'trial', label: 'Trial' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'canceled', label: 'Canceled' },
      ],
    },
  ];

  // Handle sort change
  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column);
    setSortDirection(direction);
    // In a real implementation, you would pass these to the API
    console.log('Sort by:', column, direction);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Businesses"
        description="Manage all businesses on the platform"
        isError={isError}
        errorMessage="API Error - Using cached data"
        onRefresh={refetch}
        isRefreshing={isRefetching}

      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={filters}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedRows.size}
        onClearSelection={() => setSelectedRows(new Set())}
        actions={bulkActions}
      />

      {/* Businesses Table */}
      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="heading-3 text-admin-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {totalCount} Businesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={businesses}
            columns={columns}
            getRowKey={(row) => row.id}
            loading={isLoading}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            emptyState={
              <AdminEmptyState
                icon={Building2}
                title="No businesses found"
                description={
                  search || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'No businesses have been registered yet. Businesses are created through the user registration flow.'
                }
                action={
                  search || statusFilter !== 'all'
                    ? {
                        label: 'Clear Filters',
                        onClick: () => {
                          setSearch('');
                          setStatusFilter('all');
                        },
                      }
                    : undefined
                }
              />
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

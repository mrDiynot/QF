'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Building2,
  Mail,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminUsers } from '@/hooks/admin';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader, DataTable, Pagination, FilterBar } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';

import type { AdminUserListItem } from '@/types/admin';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading, isError, refetch, isRefetching } = useAdminUsers({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize,
  });

  const users: AdminUserListItem[] = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Define table columns
  const columns: DataTableColumn<AdminUserListItem>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      width: 'min-w-[250px]',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-admin-muted flex items-center justify-center">
            <span className="text-sm font-medium text-admin-foreground">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-admin-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-admin-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'business',
      label: 'Business',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-1 text-admin-foreground">
          <Building2 className="h-4 w-4 text-admin-muted-foreground" />
          {user.businessName}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user) => (
        <Badge variant="outline" className="border-admin-border text-admin-foreground">
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) =>
        user.isActive ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      hideOnMobile: true,
      render: (user) => (
        <span className="text-admin-muted-foreground">
          {user.lastLoginAt
            ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      hideOnMobile: true,
      render: (user) => (
        <span className="text-admin-muted-foreground">
          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (user) => (
        <Link href={`/admin/users/${user.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-admin-muted-foreground hover:text-admin-foreground hover:bg-admin-muted"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Users"
        description="Manage all users across the platform"
        isError={isError}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or business..."
        filters={[
          {
            key: 'status',
            label: 'Filter by status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All Users' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
      />

      <Card className="shadow-base bg-admin-card border-admin-border">
        <CardHeader>
          <CardTitle className="text-admin-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            {totalCount} Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            getRowKey={(user) => user.id}
            loading={isLoading}
            selectable
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={(col, dir) => {
              setSortBy(col);
              setSortDirection(dir);
            }}
          />

          {totalPages > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

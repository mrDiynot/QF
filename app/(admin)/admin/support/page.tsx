'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  User,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminTickets, useTicketDashboardStats } from '@/hooks/admin';
import type { TicketStatus, TicketPriority, TicketCategory } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader, FilterBar, DataTable, Pagination } from '@/components/admin/ui';
import type { DataTableColumn } from '@/components/admin/ui/DataTable';
import { StatCard } from '@/components/admin/blocks/StatCard';

const statusOptions: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Open', label: 'Open' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'AwaitingCustomer', label: 'Awaiting Customer' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

const priorityOptions: { value: TicketPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const categoryOptions: { value: TicketCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'TechnicalSupport', label: 'Technical Support' },
  { value: 'BillingInquiry', label: 'Billing Inquiry' },
  { value: 'FeatureRequest', label: 'Feature Request' },
  { value: 'AccountIssue', label: 'Account Issue' },
  { value: 'GeneralQuestion', label: 'General Question' },
];

function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case 'New':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">New</Badge>;
    case 'Open':
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Open</Badge>;
    case 'InProgress':
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">In Progress</Badge>;
    case 'AwaitingCustomer':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Awaiting Customer</Badge>;
    case 'Resolved':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
    case 'Closed':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Closed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-500 border-gray-200">{status}</Badge>;
  }
}

function getPriorityBadge(priority: TicketPriority) {
  switch (priority) {
    case 'Critical':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>;
    case 'High':
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
    case 'Medium':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Medium</Badge>;
    case 'Low':
      return <Badge className="bg-gray-100 text-gray-500 border-gray-200">Low</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-500 border-gray-200">{priority}</Badge>;
  }
}

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Use React Query hooks for real data
  const { data, isLoading: loading, isError, refetch, isRefetching: refreshing } = useAdminTickets({
    searchTerm: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    page,
    pageSize,
  });
  const { data: statsData } = useTicketDashboardStats();

  // Extract data from response
  const tickets = data?.items || [];
  const totalCount = data?.totalItems || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const stats = statsData || { totalOpen: 0, newToday: 0, awaitingResponse: 0, slaBreached: 0, unassigned: 0, avgResponseTime: '0h', avgResolutionTime: '0h', satisfactionRate: 0 };

  // Define table columns
  const columns: DataTableColumn<typeof tickets[number]>[] = [
    {
      key: 'ticket',
      label: 'Ticket',
      sortable: true,
      width: 'min-w-[250px]',
      render: (ticket) => (
        <Link href={`/admin/support/${ticket.id}`} className="block">
          <div className="flex items-start gap-2">
            {ticket.slaBreached && <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />}
            <div>
              <p className="font-medium text-admin-foreground">{ticket.subject}</p>
              <p className="text-xs text-admin-muted-foreground">{ticket.ticketNumber}</p>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'business',
      label: 'Business',
      sortable: true,
      render: (ticket) => (
        <div>
          <p className="text-sm text-admin-foreground">{ticket.businessName}</p>
          <p className="text-xs text-admin-muted-foreground">{ticket.reporterName}</p>
          <p className="text-xs text-admin-muted-foreground">{ticket.reporterEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ticket) => getStatusBadge(ticket.status),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (ticket) => getPriorityBadge(ticket.priority),
    },
    {
      key: 'category',
      label: 'Category',
      hideOnMobile: true,
      render: (ticket) => (
        <span className="text-admin-muted-foreground text-sm">
          {ticket.category.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      ),
    },
    {
      key: 'assigned',
      label: 'Assigned',
      hideOnMobile: true,
      render: (ticket) => ticket.assignedToAdminName ? (
        <div className="flex items-center gap-1 text-sm text-admin-foreground">
          <User className="h-3 w-3" />
          {ticket.assignedToAdminName}
        </div>
      ) : (
        <span className="text-sm text-admin-muted-foreground">Unassigned</span>
      ),
    },
    {
      key: 'messages',
      label: 'Msgs',
      align: 'center' as const,
      hideOnMobile: true,
      render: (ticket) => (
        <div className="flex items-center justify-center gap-1 text-admin-muted-foreground text-sm">
          <MessageSquare className="h-3 w-3" />
          {ticket.messageCount ?? 0}
        </div>
      ),
    },
    {
      key: 'created',
      label: 'Created',
      align: 'right' as const,
      sortable: true,
      render: (ticket) => (
        <span className="text-admin-muted-foreground text-sm">
          {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Manage customer support requests and inquiries"
        isError={isError}
        onRefresh={() => refetch()}
        isRefreshing={refreshing}
        actions={
          <Link href="/admin/support/canned-responses">
            <Button variant="outline" size="sm" className="border-admin-border text-admin-foreground hover:bg-admin-muted">
              <MessageSquare className="h-4 w-4 mr-2" />
              Canned Responses
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Tickets" value={stats.totalOpen} iconColor="text-blue-400" loading={loading} />
        <StatCard title="Awaiting Response" value={stats.awaitingResponse} iconColor="text-amber-400" loading={loading} />
        <StatCard title="SLA Breached" value={stats.slaBreached} iconColor="text-red-400" loading={loading} />
        <StatCard title="New Today" value={stats.newToday} iconColor="text-green-400" loading={loading} />
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as TicketStatus | 'all'),
            options: statusOptions,
          },
          {
            key: 'priority',
            label: 'Priority',
            value: priorityFilter,
            onChange: (v) => setPriorityFilter(v as TicketPriority | 'all'),
            options: priorityOptions,
          },
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: (v) => setCategoryFilter(v as TicketCategory | 'all'),
            options: categoryOptions,
          },
        ]}
      />

      {/* Tickets Table */}
      <DataTable
        columns={columns}
        data={tickets}
        loading={loading}
        emptyMessage="No tickets found"
        emptyDescription="Try adjusting your search or filter criteria"
        getRowId={(row) => row.id}
      />

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

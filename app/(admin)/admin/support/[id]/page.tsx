'use client';

import { use, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  AlertTriangle,
  Send,
  Globe,
  RefreshCw,
  Building2,
  Tag,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { TicketStatus, TicketPriority } from '@/types/admin';
import { SLAIndicator } from '@/components/admin/blocks/SLAIndicator';
import { useAdminTicket, useAdminTicketMessages, useAddTicketMessage, useUpdateTicketStatus, useUpdateTicketPriority } from '@/hooks/admin';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // API hooks - fetch real data
  const { data: ticket, isLoading, isError, error, refetch, isRefetching } = useAdminTicket(id);
  const { data: messages } = useAdminTicketMessages(id);
  const addMessageMutation = useAddTicketMessage();
  const updateStatusMutation = useUpdateTicketStatus();
  const updatePriorityMutation = useUpdateTicketPriority();

  const loading = isLoading;
  const refreshing = isRefetching;

  const handleRefresh = () => {
    refetch();
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateStatusMutation.mutate({ ticketId: id, request: { status: newStatus } });
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    updatePriorityMutation.mutate({ ticketId: id, request: { priority: newPriority } });
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    
    addMessageMutation.mutate({
      ticketId: id,
      request: { content: reply, isInternal },
    });
    setReply('');
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusBadge = (status: TicketStatus) => {
    const styles: Record<string, string> = {
      New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      InProgress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      AwaitingCustomer: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      Closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return <Badge className={styles[status] || styles.Open}>{status.replace(/([A-Z])/g, ' $1').trim()}</Badge>;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityBadge = (priority: TicketPriority) => {
    const styles: Record<string, string> = {
      Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Low: 'bg-gray-100 text-gray-500 border-gray-200',
    };
    return <Badge className={styles[priority] || styles.Medium}>{priority}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48 bg-admin-muted" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-96 bg-admin-muted" />
          </div>
          <Skeleton className="h-96 bg-admin-muted" />
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-medium text-admin-foreground">Ticket Details</h1>
        </div>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Globe className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-400">Failed to load ticket</h3>
                <p className="text-red-300/80 text-sm">
                  {error instanceof Error ? error.message : 'Unable to fetch ticket details from the server.'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="icon" className="text-admin-muted-foreground hover:text-admin-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-medium text-admin-foreground">{ticket.subject}</h1>
              {ticket.slaBreached && (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <p className="text-admin-muted-foreground">{ticket.ticketNumber}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-admin-border text-admin-foreground hover:bg-admin-muted"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSentByAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.isSentByAdmin
                            ? 'bg-orange-500/20 border border-orange-500/30'
                            : 'bg-admin-muted border border-admin-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-admin-foreground">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-admin-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                          {message.isInternal && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-admin-foreground">{message.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-admin-muted-foreground">
                    No messages yet
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="border-t border-admin-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isInternal ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsInternal(!isInternal)}
                    className={isInternal ? 'bg-amber-500 hover:bg-amber-600' : 'border-admin-border text-admin-foreground'}
                  >
                    {isInternal ? 'Internal Note' : 'Public Reply'}
                  </Button>
                  {isInternal && (
                    <span className="text-xs text-amber-400">Only visible to admins</span>
                  )}
                </div>
                <Textarea
                  placeholder={isInternal ? 'Add internal note...' : 'Type your reply...'}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                  className="bg-admin-background border-admin-border text-admin-foreground"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendReply}
                    disabled={!reply.trim()}
                    className="bg-[#FF6900] hover:bg-orange-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isInternal ? 'Add Note' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-admin-muted-foreground">Status</label>
                <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                  <SelectTrigger className="mt-1 bg-admin-background border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="AwaitingCustomer">Awaiting Customer</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-admin-muted-foreground">Priority</label>
                <Select value={ticket.priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)}>
                  <SelectTrigger className="mt-1 bg-admin-background border-admin-border text-admin-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border">
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t border-admin-border space-y-3">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-admin-muted-foreground" />
                  <span className="text-sm text-admin-foreground">
                    {ticket.category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-admin-muted-foreground" />
                  <span className="text-sm text-admin-foreground">
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4 w-4 text-admin-muted-foreground" />
                  <span className="text-sm text-admin-foreground">
                    {ticket.assignedToAdminName || 'Unassigned'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SLA Tracking */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">SLA Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SLAIndicator
                firstResponseDue={ticket.firstResponseDue}
                resolutionDue={ticket.resolutionDue}
                firstResponseAt={ticket.firstResponseAt}
                resolvedAt={ticket.resolvedAt}
                slaBreached={ticket.slaBreached}
                status={ticket.status}
              />
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-admin-muted-foreground" />
                <span className="text-sm text-admin-foreground">{ticket.reporterName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-admin-muted-foreground" />
                <Link
                  href={`/admin/businesses/${ticket.businessId}`}
                  className="text-sm text-blue-400 hover:underline"
                >
                  {ticket.businessName}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-admin-card border-admin-border">
            <CardHeader>
              <CardTitle className="text-admin-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-admin-border text-admin-foreground hover:bg-admin-muted"
                onClick={() => handleStatusChange('Resolved')}
              >
                Mark as Resolved
              </Button>
              <Button
                variant="outline"
                className="w-full border-admin-border text-admin-foreground hover:bg-admin-muted"
                onClick={() => handleStatusChange('Closed')}
              >
                Close Ticket
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

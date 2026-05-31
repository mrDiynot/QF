'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useTicket, useTicketMessages, useAddTicketMessage } from '@/hooks/api/useSupport';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import type {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketMessage,
} from '@/services/api/support.service';

function getStatusBadge(status: TicketStatus) {
  const styles: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700 border-blue-200',
    Open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    InProgress: 'bg-purple-100 text-purple-700 border-purple-200',
    AwaitingCustomer: 'bg-amber-100 text-amber-700 border-amber-200',
    AwaitingInternal: 'bg-orange-100 text-orange-700 border-orange-200',
    OnHold: 'bg-slate-100 text-slate-700 border-slate-200',
    Resolved: 'bg-green-100 text-green-700 border-green-200',
    Closed: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const labels: Record<string, string> = {
    InProgress: 'In Progress',
    AwaitingCustomer: 'Awaiting Your Reply',
    AwaitingInternal: 'Under Review',
    OnHold: 'On Hold',
  };
  return <Badge className={styles[status] || styles.New}>{labels[status] || status}</Badge>;
}

function getPriorityBadge(priority: TicketPriority) {
  const styles: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return <Badge className={styles[priority] || styles.Medium}>{priority}</Badge>;
}

function formatCategory(category: TicketCategory): string {
  const map: Record<TicketCategory, string> = {
    None: 'None',
    TechnicalSupport: 'Technical Support',
    BillingInquiry: 'Billing Inquiry',
    FeatureRequest: 'Feature Request',
    AccountIssue: 'Account Issue',
    GeneralQuestion: 'General Question',
  };
  return map[category] || category;
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const { data: ticket, isLoading: ticketLoading } = useTicket(ticketId);
  const { data: messages, isLoading: messagesLoading } = useTicketMessages(ticketId);
  const addMessage = useAddTicketMessage();

  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = () => {
    if (!replyContent.trim()) return;

    addMessage.mutate(
      {
        ticketId,
        request: { content: replyContent },
      },
      {
        onSuccess: () => {
          setReplyContent('');
        },
      }
    );
  };

  const isTicketClosed = ticket?.status === 'Closed' || ticket?.status === 'Resolved';

  if (ticketLoading) {
    return (
      <div className="animate-fade-in pt-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
          <div className="h-96 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="animate-fade-in pt-4">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text-navy mb-2">Ticket Not Found</h2>
          <p className="text-text-secondary mb-6">
            The ticket you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/support">
            <Button className="bg-brand-purple text-white hover:bg-brand-purple/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/support">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text-navy">{ticket.ticketNumber}</h1>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
            <p className="text-text-secondary mt-1">{ticket.subject}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-text-navy text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-navy text-lg">
                <MessageSquare className="h-5 w-5" />
                Conversation ({messages?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messagesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded" />
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <p className="text-text-secondary text-center py-8">
                  No messages yet. Add a reply below to continue the conversation.
                </p>
              ) : (
                messages?.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}

              {!isTicketClosed && (
                <>
                  <Separator />
                  {/* Reply Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyContent.trim() || addMessage.isPending}
                        className="bg-brand-purple text-white hover:bg-brand-purple/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addMessage.isPending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {isTicketClosed && (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-text-navy font-medium">This ticket has been {ticket.status.toLowerCase()}</p>
                  <p className="text-text-secondary text-sm">
                    If you need further assistance, please create a new ticket.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-text-navy text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Status</p>
                {getStatusBadge(ticket.status)}
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Priority</p>
                {getPriorityBadge(ticket.priority)}
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Category</p>
                <p className="text-text-navy">{formatCategory(ticket.category)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Assigned To</p>
                <p className="text-text-navy">
                  {ticket.assignedToAdminName || (
                    <span className="text-text-secondary italic">Not assigned yet</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text-navy text-lg">
                <Clock className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                  <Calendar className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-text-navy font-medium">Created</p>
                  <p className="text-xs text-text-secondary">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {ticket.firstResponseAt && (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                    <CheckCircle2 className="size-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-navy font-medium">First Response</p>
                    <p className="text-xs text-text-secondary">
                      {format(new Date(ticket.firstResponseAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {ticket.resolvedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-navy font-medium">Resolved</p>
                    <p className="text-xs text-text-secondary">
                      {format(new Date(ticket.resolvedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {ticket.updatedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                    <Clock className="size-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-navy font-medium">Last Updated</p>
                    <p className="text-xs text-text-secondary">
                      {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isAdmin = message.isSentByAdmin;

  return (
    <div
      className={`p-4 rounded-lg ${
        isAdmin ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50 border border-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`size-8 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-purple-200' : 'bg-slate-200'
            }`}
          >
            <User className={`size-4 ${isAdmin ? 'text-purple-700' : 'text-slate-700'}`} />
          </div>
          <div>
            <span className={`font-medium text-sm ${isAdmin ? 'text-purple-700' : 'text-text-navy'}`}>
              {message.senderName}
            </span>
            {isAdmin && (
              <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-200 text-xs">
                Support Team
              </Badge>
            )}
          </div>
        </div>
        <span className="text-xs text-text-secondary">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-text-secondary text-sm whitespace-pre-wrap pl-10">{message.content}</p>
      {message.attachments.length > 0 && (
        <div className="mt-2 pl-10 flex flex-wrap gap-2">
          {message.attachments.map((attachment) => (
            <Badge key={attachment.id} variant="outline" className="text-xs">
              {attachment.fileName}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

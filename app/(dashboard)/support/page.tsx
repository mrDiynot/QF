'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from '@/components/modals';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Plus,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMyTickets, useCreateTicket } from '@/hooks/api/useSupport';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  CreateTicketRequest,
  SupportTicket,
} from '@/services/api/support.service';

const categoryOptions: { value: TicketCategory; label: string }[] = [
  { value: 'TechnicalSupport', label: 'Technical Support' },
  { value: 'BillingInquiry', label: 'Billing Inquiry' },
  { value: 'FeatureRequest', label: 'Feature Request' },
  { value: 'AccountIssue', label: 'Account Issue' },
  { value: 'GeneralQuestion', label: 'General Question' },
];

const priorityOptions: { value: TicketPriority; label: string; description: string }[] = [
  { value: 'Low', label: 'Low', description: 'General questions, no urgency' },
  { value: 'Medium', label: 'Medium', description: 'Important but not blocking' },
  { value: 'High', label: 'High', description: 'Affecting productivity' },
  { value: 'Critical', label: 'Critical', description: 'System down, blocking work' },
];

function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case 'New':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>;
    case 'Open':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Open</Badge>;
    case 'InProgress':
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">In Progress</Badge>;
    case 'AwaitingCustomer':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Awaiting Your Reply</Badge>;
    case 'AwaitingInternal':
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Under Review</Badge>;
    case 'OnHold':
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200">On Hold</Badge>;
    case 'Resolved':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Resolved</Badge>;
    case 'Closed':
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Closed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function getPriorityBadge(priority: TicketPriority) {
  switch (priority) {
    case 'Critical':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Critical</Badge>;
    case 'High':
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>;
    case 'Medium':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>;
    case 'Low':
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
}

function formatCategory(category: TicketCategory): string {
  const map: Record<TicketCategory, string> = {
    None: 'None',
    TechnicalSupport: 'Technical',
    BillingInquiry: 'Billing',
    FeatureRequest: 'Feature Request',
    AccountIssue: 'Account',
    GeneralQuestion: 'General',
  };
  return map[category] || category;
}

export default function SupportPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState<CreateTicketRequest>({
    category: 'GeneralQuestion',
    priority: 'Medium',
    subject: '',
    description: '',
  });

  const { data: ticketsData, isLoading } = useMyTickets({ page, pageSize: 10 });
  const createTicket = useCreateTicket();

  const contactOptions = [
    {
      icon: <MessageCircle className="size-6 text-green-600" />,
      title: 'Live Chat',
      description: 'Average wait: 2 mins',
      bgColor: 'bg-green-50',
    },
    {
      icon: <Mail className="size-6 text-blue-600" />,
      title: 'Email Support',
      description: 'Response in 24hrs',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <Phone className="size-6 text-purple-600" />,
      title: 'Phone Support',
      description: 'Mon-Fri 9AM-6PM EST',
      bgColor: 'bg-purple-50',
    },
    {
      icon: <Calendar className="size-6 text-orange-600" />,
      title: 'Book a Call',
      description: 'Schedule with expert',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleOpenCreate = () => {
    setFormData({
      category: 'GeneralQuestion',
      priority: 'Medium',
      subject: '',
      description: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      return;
    }
    createTicket.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData({
          category: 'GeneralQuestion',
          priority: 'Medium',
          subject: '',
          description: '',
        });
      },
    });
  };

  // Calculate stats
  const openTickets = ticketsData?.items.filter(
    (t) => !['Resolved', 'Closed'].includes(t.status)
  ).length ?? 0;
  const awaitingReply = ticketsData?.items.filter(
    (t) => t.status === 'AwaitingCustomer'
  ).length ?? 0;
  const resolvedTickets = ticketsData?.items.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length ?? 0;

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold text-text-navy">Support Center</h1>
          <p className="text-base mt-3 text-text-secondary">
            Get help from our team or browse resources
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-brand-purple text-white hover:bg-brand-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Contact Options */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-text-navy">Contact Us</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactOptions.map((option, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl ${option.bgColor} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white">
                  {option.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-navy mb-1">{option.title}</h3>
                  <p className="text-xs text-text-secondary">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ticket Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100">
              <Ticket className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-navy">{openTickets}</p>
              <p className="text-sm text-text-secondary">Open Tickets</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="size-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-navy">{awaitingReply}</p>
              <p className="text-sm text-text-secondary">Awaiting Your Reply</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-navy">{resolvedTickets}</p>
              <p className="text-sm text-text-secondary">Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* My Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-navy">
            <Ticket className="h-5 w-5" />
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-slate-100 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : ticketsData?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-text-secondary">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium mb-2">No tickets yet</p>
                    <p className="text-sm mb-4">Create your first support ticket to get help</p>
                    <Button
                      onClick={handleOpenCreate}
                      className="bg-brand-purple text-white hover:bg-brand-purple/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                ticketsData?.items.map((ticket: SupportTicket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-text-navy">{ticket.ticketNumber}</p>
                        <p className="text-sm text-text-secondary line-clamp-1 max-w-[200px]">
                          {ticket.subject}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {formatCategory(ticket.category)}
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell className="text-text-secondary text-sm">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/support/${ticket.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {ticketsData && ticketsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-text-secondary">
                Page {ticketsData.page} of {ticketsData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === ticketsData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Modal open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Create Support Ticket</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Brief description of your issue..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as TicketCategory })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as TicketPriority })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[220px]">
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've already tried..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="mt-1.5 resize-none"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.subject.trim() ||
                !formData.description.trim() ||
                createTicket.isPending
              }
              className="bg-brand-purple text-white hover:bg-brand-purple/90"
            >
              {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

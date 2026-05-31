'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminSupportService } from '@/services/api/admin.service';
import { useAdminAnalytics, AdminEvents } from './useAdminAnalytics';
import type {
  TicketQuery,
  AddTicketMessageRequest,
  UpdateTicketStatusRequest,
  AssignTicketRequest,
  UpdateTicketPriorityRequest,
} from '@/types/admin';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

// Query keys
export const supportKeys = {
  all: ['admin', 'support'] as const,
  tickets: () => [...supportKeys.all, 'tickets'] as const,
  ticketList: (query: TicketQuery) => [...supportKeys.tickets(), query] as const,
  ticket: (id: string) => [...supportKeys.tickets(), id] as const,
  messages: (ticketId: string) => [...supportKeys.ticket(ticketId), 'messages'] as const,
  dashboard: () => [...supportKeys.all, 'dashboard'] as const,
  myTickets: (query: TicketQuery) => [...supportKeys.all, 'my-tickets', query] as const,
};

/**
 * Hook to fetch paginated support tickets with filtering
 */
export function useAdminTickets(query: TicketQuery) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: supportKeys.ticketList(query),
    queryFn: async () => {
      if (query.searchTerm) {
        track(AdminEvents.ADMIN_TICKET_SEARCHED, {
          search_term: query.searchTerm,
          status_filter: query.status,
          priority_filter: query.priority,
          category_filter: query.category,
        });
      }
      return adminSupportService.getTickets(query);
    },
    ...queryConfig.realtime, // Tickets need real-time updates
  });
}

/**
 * Hook to fetch a single support ticket by ID
 */
export function useAdminTicket(id: string) {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: supportKeys.ticket(id),
    queryFn: async () => {
      track(AdminEvents.ADMIN_TICKET_VIEWED, { ticket_id: id });
      return adminSupportService.getTicket(id);
    },
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Hook to fetch messages for a ticket
 */
export function useAdminTicketMessages(ticketId: string, includeInternal = true) {
  return useQuery({
    queryKey: supportKeys.messages(ticketId),
    queryFn: () => adminSupportService.getTicketMessages(ticketId, includeInternal),
    enabled: !!ticketId,
    ...queryConfig.realtime, // Messages need real-time updates
  });
}

/**
 * Hook to add a message to a ticket
 */
export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      ticketId,
      request,
    }: {
      ticketId: string;
      request: AddTicketMessageRequest;
    }) => {
      track(
        request.isInternal
          ? AdminEvents.ADMIN_TICKET_INTERNAL_NOTE_ADDED
          : AdminEvents.ADMIN_TICKET_MESSAGE_SENT,
        {
          ticket_id: ticketId,
          is_internal: request.isInternal,
        }
      );
      return adminSupportService.addMessage(ticketId, request);
    },
    onSuccess: (_, { ticketId, request }) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.messages(ticketId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId), refetchType: 'all' });
      toast.success(request.isInternal ? 'Internal note added' : 'Reply sent');
    },
    onError: (error, { ticketId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Add message failed'), {
        action: 'add_ticket_message',
        ticket_id: ticketId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    },
  });
}

/**
 * Hook to update ticket status
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      ticketId,
      request,
    }: {
      ticketId: string;
      request: UpdateTicketStatusRequest;
    }) => {
      track(AdminEvents.ADMIN_TICKET_STATUS_UPDATED, {
        ticket_id: ticketId,
        new_status: request.status,
      });
      return adminSupportService.updateStatus(ticketId, request);
    },
    onSuccess: (_, { ticketId }) => {
      invalidateListQueries(queryClient, supportKeys.tickets());
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard(), refetchType: 'all' });
      toast.success('Ticket status updated');
    },
    onError: (error, { ticketId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Update status failed'), {
        action: 'update_ticket_status',
        ticket_id: ticketId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    },
  });
}

/**
 * Hook to assign a ticket to an admin
 */
export function useAssignTicket() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      ticketId,
      request,
    }: {
      ticketId: string;
      request: AssignTicketRequest;
    }) => {
      track(AdminEvents.ADMIN_TICKET_ASSIGNED, {
        ticket_id: ticketId,
        assigned_to: request.adminId,
      });
      return adminSupportService.assignTicket(ticketId, request);
    },
    onSuccess: (_, { ticketId }) => {
      invalidateListQueries(queryClient, supportKeys.tickets());
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard(), refetchType: 'all' });
      toast.success('Ticket assigned');
    },
    onError: (error, { ticketId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Assign ticket failed'), {
        action: 'assign_ticket',
        ticket_id: ticketId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to assign ticket');
    },
  });
}

/**
 * Hook to update ticket priority
 */
export function useUpdateTicketPriority() {
  const queryClient = useQueryClient();
  const { track, trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: ({
      ticketId,
      request,
    }: {
      ticketId: string;
      request: UpdateTicketPriorityRequest;
    }) => {
      track(AdminEvents.ADMIN_TICKET_PRIORITY_UPDATED, {
        ticket_id: ticketId,
        new_priority: request.priority,
      });
      return adminSupportService.updatePriority(ticketId, request);
    },
    onSuccess: (_, { ticketId }) => {
      invalidateListQueries(queryClient, supportKeys.tickets());
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId), refetchType: 'all' });
      toast.success('Ticket priority updated');
    },
    onError: (error, { ticketId }) => {
      trackAdminError(error instanceof Error ? error : new Error('Update priority failed'), {
        action: 'update_ticket_priority',
        ticket_id: ticketId,
      });
      toast.error(error instanceof Error ? error.message : 'Failed to update priority');
    },
  });
}

/**
 * Hook to fetch support dashboard statistics
 */
export function useTicketDashboardStats() {
  const { track } = useAdminAnalytics();

  return useQuery({
    queryKey: supportKeys.dashboard(),
    queryFn: async () => {
      track(AdminEvents.ADMIN_SUPPORT_DASHBOARD_VIEWED);
      return adminSupportService.getDashboardStats();
    },
    ...queryConfig.dashboard, // Use dashboard config with polling
  });
}

/**
 * Hook to fetch tickets assigned to the current admin
 */
export function useMyAssignedTickets(query: TicketQuery) {
  return useQuery({
    queryKey: supportKeys.myTickets(query),
    queryFn: () => adminSupportService.getMyAssignedTickets(query),
    ...queryConfig.realtime,
  });
}

/**
 * Hook to manually trigger SLA breach check
 */
export function useCheckSlaBreaches() {
  const queryClient = useQueryClient();
  const { trackAdminError } = useAdminAnalytics();

  return useMutation({
    mutationFn: () => adminSupportService.checkSlaBreaches(),
    onSuccess: () => {
      invalidateListQueries(queryClient, supportKeys.tickets());
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard(), refetchType: 'all' });
    },
    onError: (error) => {
      trackAdminError(error instanceof Error ? error : new Error('SLA check failed'), {
        action: 'check_sla_breaches',
      });
    },
  });
}

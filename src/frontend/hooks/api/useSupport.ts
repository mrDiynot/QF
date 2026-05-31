/**
 * Support Ticket React Query Hooks
 * Customer-facing support ticket operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/services/api';
import { toast } from 'sonner';
import type {
  CreateTicketRequest,
  AddMessageRequest,
  TicketQuery,
} from '@/services/api/support.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const supportKeys = {
  all: ['support'] as const,
  tickets: () => [...supportKeys.all, 'tickets'] as const,
  ticketList: (filters: TicketQuery) => [...supportKeys.tickets(), filters] as const,
  ticket: (id: string) => [...supportKeys.tickets(), id] as const,
  messages: (ticketId: string) => [...supportKeys.ticket(ticketId), 'messages'] as const,
};

/**
 * Hook to fetch current user's support tickets
 */
export function useMyTickets(query?: TicketQuery) {
  return useQuery({
    queryKey: supportKeys.ticketList(query || {}),
    queryFn: () => supportService.getMyTickets(query),
    ...queryConfig.standard,
  });
}

/**
 * Hook to fetch a single support ticket
 */
export function useTicket(id: string) {
  return useQuery({
    queryKey: supportKeys.ticket(id),
    queryFn: () => supportService.getTicket(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

/**
 * Hook to fetch messages for a ticket
 */
export function useTicketMessages(ticketId: string) {
  return useQuery({
    queryKey: supportKeys.messages(ticketId),
    queryFn: () => supportService.getTicketMessages(ticketId),
    enabled: !!ticketId,
    ...queryConfig.realtime, // Messages need real-time updates
    refetchInterval: 30000, // Auto-refresh every 30 seconds when viewing
  });
}

/**
 * Hook to create a new support ticket
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTicketRequest) => supportService.createTicket(request),
    onSuccess: (ticket) => {
      invalidateListQueries(queryClient, supportKeys.all);
      toast.success(`Ticket ${ticket.ticketNumber} created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create support ticket');
    },
  });
}

/**
 * Hook to add a message to a ticket
 */
export function useAddTicketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: string; request: AddMessageRequest }) =>
      supportService.addMessage(ticketId, request),
    onSuccess: (_, { ticketId }) => {
      queryClient.removeQueries({ queryKey: supportKeys.messages(ticketId) });
      queryClient.invalidateQueries({ queryKey: supportKeys.messages(ticketId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId), refetchType: 'all' });
      toast.success('Reply sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reply');
    },
  });
}

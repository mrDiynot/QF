/**
 * Conversations React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsService, messagesService } from '@/services/api';
import { toast } from 'sonner';
import type { CreateMessageRequest, Channel } from '@/types/api';
import { queryConfig } from '@/lib/query-config';

// Extended conversation type for internal use - uses partial to allow flexible API responses
interface ConversationWithExtras {
  id: string;
  contactId?: string;
  channel?: string;
  channelType?: string;
  status?: 'active' | 'closed' | 'archived' | 'open';
  unreadCount?: number;
  messageCount?: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isAIHandling?: boolean;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedToUserId?: string;
  leadId?: string;
  businessId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  startedAt?: string;
  endedAt?: string;
}

export const conversationsKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...conversationsKeys.lists(), filters] as const,
  details: () => [...conversationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationsKeys.details(), id] as const,
  notes: (id: string) => [...conversationsKeys.detail(id), 'notes'] as const,
};

export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...messagesKeys.lists(), filters] as const,
};

export function useConversations(params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: conversationsKeys.list(params || {}),
    queryFn: () => conversationsService.getConversations(params),
    ...queryConfig.realtime, // Conversations are real-time critical
  });
}

export function useConversationList() {
  return useQuery({
    queryKey: conversationsKeys.lists(),
    queryFn: conversationsService.getConversationList,
    ...queryConfig.realtime,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationsKeys.detail(id),
    queryFn: () => conversationsService.getConversationById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useConversationNotes(conversationId: string) {
  return useQuery({
    queryKey: conversationsKeys.notes(conversationId),
    queryFn: () => conversationsService.getNotes(conversationId),
    enabled: !!conversationId,
    ...queryConfig.standard,
  });
}

export function useMessages(params?: {
  conversationId?: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: messagesKeys.list(params || {}),
    queryFn: () => messagesService.getMessages(params),
    ...queryConfig.realtime, // Messages are real-time critical
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageRequest) => messagesService.sendMessage(data),
    onSuccess: (_, variables) => {
      // Force immediate refetch of messages for this conversation
      queryClient.removeQueries({
        queryKey: messagesKeys.list({ conversationId: variables.conversationId })
      });
      queryClient.invalidateQueries({
        queryKey: messagesKeys.list({ conversationId: variables.conversationId }),
        refetchType: 'all'
      });
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.detail(variables.conversationId),
        refetchType: 'all'
      });
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.lists(), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists(), refetchType: 'all' });
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      conversationsService.createNote(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.notes(variables.conversationId),
        refetchType: 'all'
      });
      toast.success('Note added');
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });
}

/**
 * Hook to fetch conversations filtered by channel type
 * Normalizes the channel field across different API responses
 */
export function useConversationsByChannel(channelType: string) {
  return useQuery({
    queryKey: [...conversationsKeys.lists(), 'channel', channelType.toLowerCase()],
    queryFn: async () => {
      const response = await conversationsService.getConversations();
      const items = response.items || response || [];

      // Normalize and filter by channel - check both 'channel' and 'channelType' fields
      return (items as ConversationWithExtras[]).filter((conv) => {
        const channel = (conv.channel || conv.channelType || '').toLowerCase();
        return channel === channelType.toLowerCase();
      }).map((conv) => ({
        // Normalize the conversation object to have consistent field names
        id: conv.id,
        leadId: conv.leadId,
        businessId: conv.businessId,
        channel: conv.channel || conv.channelType || channelType,
        channelType: conv.channel || conv.channelType || channelType,
        status: conv.status,
        unreadCount: conv.unreadCount || 0,
        messageCount: conv.messageCount || 0,
        startedAt: conv.startedAt,
        endedAt: conv.endedAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessageAt: conv.lastMessageAt || conv.updatedAt || conv.startedAt,
        // Contact info - may come from different fields
        contactId: conv.contactId || conv.leadId,
        contactName: conv.contactName,
        contactEmail: conv.contactEmail,
        contactPhone: conv.contactPhone,
        // AI handling
        isAIHandling: conv.isAIHandling,
        assignedToUserId: conv.assignedToUserId,
        assignedAgentId: conv.assignedAgentId,
        assignedAgentName: conv.assignedAgentName,
      }));
    },
    enabled: !!channelType,
  });
}

/**
 * Hook to fetch a channel by type (e.g., 'sms', 'voice', 'whatsapp')
 * Case-insensitive matching
 */
export function useChannelByType(channelType: string) {
  return useQuery({
    queryKey: ['channels', 'byType', channelType.toLowerCase()],
    queryFn: async () => {
      const { channelsService } = await import('@/services/api/channels.service');
      const channels = await channelsService.getChannels();
      return channels.find((c: Channel) =>
        c.type?.toLowerCase() === channelType.toLowerCase()
      ) || null;
    },
    enabled: !!channelType,
  });
}
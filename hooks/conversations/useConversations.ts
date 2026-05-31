/**
 * Conversations React Query hooks
 * Provides hooks for conversation management with caching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { conversationsService, messagesService } from '@/services/api/conversations.service';
import { handleApiError } from '@/lib/axios';
import type { CreateMessageRequest } from '@/types/api';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

/** Query key factory for conversations */
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (conversationId: string) => [...conversationKeys.all, 'messages', conversationId] as const,
  notes: (conversationId: string) => [...conversationKeys.all, 'notes', conversationId] as const,
  unreadCount: (id: string) => [...conversationKeys.all, 'unread', id] as const,
};

/**
 * Hook to fetch all conversations with pagination and filtering
 */
export const useConversations = (params?: {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  channel?: string;
}) => {
  return useQuery({
    queryKey: conversationKeys.list(params || {}),
    queryFn: () => conversationsService.getConversations(params),
    ...queryConfig.realtime, // Conversations need real-time updates
  });
};

/**
 * Hook to fetch simplified conversation list
 */
export const useConversationList = () => {
  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: conversationsService.getConversationList,
    ...queryConfig.realtime,
  });
};

/**
 * Hook to fetch a single conversation by ID
 */
export const useConversation = (id: string) => {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => conversationsService.getConversationById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
};

/**
 * Hook to fetch messages for a conversation
 */
export const useMessages = (conversationId: string, params?: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => messagesService.getMessages({ conversationId, ...params }),
    enabled: !!conversationId,
    ...queryConfig.realtime, // Messages need real-time updates
  });
};

/**
 * Hook to fetch unread count for a conversation
 */
export const useUnreadCount = (id: string) => {
  return useQuery({
    queryKey: conversationKeys.unreadCount(id),
    queryFn: () => conversationsService.getUnreadCount(id),
    enabled: !!id,
    ...queryConfig.realtime,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook to send a message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageRequest) => messagesService.sendMessage(data),
    onSuccess: (_, variables) => {
      invalidateListQueries(queryClient, conversationKeys.messages(variables.conversationId), [
        conversationKeys.lists(),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to mark a message as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messagesService.markAsRead(messageId),
    onSuccess: () => {
      invalidateListQueries(queryClient, conversationKeys.all);
    },
  });
};

/**
 * Hook to create a conversation note
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      conversationsService.createNote(conversationId, content),
    onSuccess: (_, variables) => {
      toast.success('Note added');
      invalidateListQueries(queryClient, conversationKeys.notes(variables.conversationId));
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};

/**
 * Hook to fetch conversation notes
 */
export const useConversationNotes = (conversationId: string) => {
  return useQuery({
    queryKey: conversationKeys.notes(conversationId),
    queryFn: () => conversationsService.getNotes(conversationId),
    enabled: !!conversationId,
    ...queryConfig.standard,
  });
};

/**
 * Hook to takeover/release conversation from AI
 */
export const useTakeoverConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, takeControl }: { conversationId: string; takeControl: boolean }) =>
      conversationsService.takeoverConversation(conversationId, takeControl),
    onSuccess: (_, variables) => {
      toast.success(variables.takeControl ? 'You are now handling this conversation' : 'AI is now handling this conversation');
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(variables.conversationId), refetchType: 'all' });
      invalidateListQueries(queryClient, conversationKeys.lists());
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
};


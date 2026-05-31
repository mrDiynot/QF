/**
 * Chat Widgets React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatWidgetsService, type CreateChatWidgetRequest } from '@/services/api/chat-widgets.service';
import { queryConfig, invalidateListQueries } from '@/lib/query-config';

export const chatWidgetKeys = {
  all: ['chat-widgets'] as const,
  list: () => [...chatWidgetKeys.all, 'list'] as const,
  detail: (id: string) => [...chatWidgetKeys.all, 'detail', id] as const,
};

export function useChatWidgets() {
  return useQuery({
    queryKey: chatWidgetKeys.list(),
    queryFn: chatWidgetsService.getChatWidgets,
    ...queryConfig.standard,
  });
}

export function useChatWidget(id: string) {
  return useQuery({
    queryKey: chatWidgetKeys.detail(id),
    queryFn: () => chatWidgetsService.getChatWidgetById(id),
    enabled: !!id,
    ...queryConfig.detail,
  });
}

export function useCreateChatWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChatWidgetRequest) => chatWidgetsService.createChatWidget(data),
    onSuccess: () => {
      invalidateListQueries(queryClient, chatWidgetKeys.all, [['ai-readiness']]);
    },
  });
}

export function useUpdateChatWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateChatWidgetRequest> }) =>
      chatWidgetsService.updateChatWidget(id, data),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, chatWidgetKeys.all, [['ai-readiness']]);
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.detail(id), refetchType: 'all' });
    },
  });
}

export function useDeleteChatWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => chatWidgetsService.deleteChatWidget(id),
    onSuccess: () => {
      invalidateListQueries(queryClient, chatWidgetKeys.all, [['ai-readiness']]);
    },
  });
}

export function useToggleChatWidgetActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      chatWidgetsService.toggleActive(id, isActive),
    onSuccess: (_, { id }) => {
      invalidateListQueries(queryClient, chatWidgetKeys.all, [['ai-readiness']]);
      queryClient.invalidateQueries({ queryKey: chatWidgetKeys.detail(id), refetchType: 'all' });
    },
  });
}

/**
 * AI Quick Reply Suggestions Hook
 * React Query hook for fetching AI-powered quick reply suggestions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/api/ai.service';
import type {
  QuickReplySuggestionRequest,
  ConversationHistoryItem,
  LeadContext,
} from '@/types/ai-quick-replies';

// Query keys for quick replies
export const quickReplyKeys = {
  all: ['quick-replies'] as const,
  suggestions: (conversationId: string) => [...quickReplyKeys.all, 'suggestions', conversationId] as const,
};

interface UseQuickReplySuggestionsOptions {
  /** The conversation ID */
  conversationId: string;
  /** The last customer message */
  lastCustomerMessage: string;
  /** Recent conversation history */
  conversationHistory?: ConversationHistoryItem[];
  /** Channel type */
  channelType?: string;
  /** Lead context for personalization */
  leadContext?: LeadContext;
  /** Whether to enable the query */
  enabled?: boolean;
  /** Stale time in milliseconds (default: 30 seconds) */
  staleTime?: number;
}

/**
 * Hook to fetch quick reply suggestions for a conversation.
 * Automatically refetches when the last customer message changes.
 */
export function useQuickReplySuggestions({
  conversationId,
  lastCustomerMessage,
  conversationHistory,
  channelType,
  leadContext,
  enabled = true,
  staleTime = 30000,
}: UseQuickReplySuggestionsOptions) {
  return useQuery({
    queryKey: [...quickReplyKeys.suggestions(conversationId), lastCustomerMessage],
    queryFn: async () => {
      const request: QuickReplySuggestionRequest = {
        conversationId,
        lastCustomerMessage,
        conversationHistory,
        channelType,
        leadContext,
        maxSuggestions: 5,
      };
      return aiService.getQuickReplySuggestions(request);
    },
    enabled: enabled && !!conversationId && !!lastCustomerMessage.trim(),
    staleTime,
    gcTime: 60000, // Keep in cache for 1 minute
    retry: 1, // Only retry once for speed
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to manually trigger quick reply generation.
 * Useful for refresh button or when auto-fetch is disabled.
 */
export function useGenerateQuickReplies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: QuickReplySuggestionRequest) =>
      aiService.getQuickReplySuggestions(request),
    onSuccess: (data, variables) => {
      // Update the cache with the new suggestions
      queryClient.setQueryData(
        [...quickReplyKeys.suggestions(variables.conversationId), variables.lastCustomerMessage],
        data
      );
    },
  });
}

/**
 * Hook to invalidate quick reply cache for a conversation.
 * Call this when a new message is received.
 */
export function useInvalidateQuickReplies() {
  const queryClient = useQueryClient();

  return (conversationId: string) => {
    queryClient.invalidateQueries({
      queryKey: quickReplyKeys.suggestions(conversationId),
    });
  };
}


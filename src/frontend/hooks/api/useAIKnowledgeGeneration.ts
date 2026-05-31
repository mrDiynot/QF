/**
 * AI Knowledge Generation React Query Hooks
 * Provides hooks for generating knowledge base articles and extracting FAQs
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import aiService from '@/services/api/ai.service';
import type {
  KnowledgeGenerationRequest,
  KnowledgeArticleResult,
  ExtractFaqsRequest,
  ExtractFaqsResult,
} from '@/types/ai-knowledge';
import { knowledgeBaseKeys } from './useKnowledgeBase';

/**
 * Hook for generating knowledge base articles using AI.
 * Creates article content based on topic and entry type.
 *
 * @example
 * const { mutate: generate, isPending } = useAIKnowledgeGeneration();
 * generate({ topic: 'How to qualify leads', entryType: 'FAQ' });
 */
export function useAIKnowledgeGeneration() {
  return useMutation<KnowledgeArticleResult, Error, KnowledgeGenerationRequest>({
    mutationFn: (request) => aiService.generateKnowledgeArticle(request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Article generated successfully!');
      } else if (data.limitExceeded) {
        toast.error('AI usage limit exceeded. Please upgrade your plan.');
      } else {
        toast.error(data.errorMessage || 'Failed to generate article');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate article');
    },
  });
}

/**
 * Hook for extracting FAQs from conversation history using AI.
 * Analyzes recent conversations to identify common questions.
 *
 * @example
 * const { mutate: extract, isPending } = useAIFaqExtraction();
 * extract({ daysToAnalyze: 30, maxFaqs: 10 });
 */
export function useAIFaqExtraction() {
  return useMutation<ExtractFaqsResult, Error, ExtractFaqsRequest>({
    mutationFn: (request) => aiService.extractFaqsFromConversations(request),
    onSuccess: (data) => {
      if (data.success) {
        if (data.faqs.length > 0) {
          toast.success(`Extracted ${data.faqs.length} FAQ(s) from ${data.conversationsAnalyzed} conversations`);
        } else {
          toast.info('No FAQs could be extracted from your conversations');
        }
      } else if (data.limitExceeded) {
        toast.error('AI usage limit exceeded. Please upgrade your plan.');
      } else {
        toast.error(data.errorMessage || 'Failed to extract FAQs');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to extract FAQs');
    },
  });
}

/**
 * Hook for saving a generated article to the knowledge base.
 * Uses the knowledge base service to persist the article.
 */
export function useSaveGeneratedArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: KnowledgeArticleResult) => {
      const { knowledgeBaseService } = await import('@/services/api/knowledge-base.service');
      return knowledgeBaseService.createArticle({
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.suggestedTags,
        isPublished: false,
      });
    },
    onSuccess: () => {
      // Invalidate knowledge base queries to refresh the list
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all });
      toast.success('Article saved to knowledge base!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save article');
    },
  });
}

/**
 * Hook for bulk saving extracted FAQs to the knowledge base.
 * Saves multiple FAQs in sequence.
 */
export function useSaveExtractedFaqs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqs: { question: string; answer: string; category?: string }[]) => {
      const { knowledgeBaseService } = await import('@/services/api/knowledge-base.service');
      const results = await Promise.all(
        faqs.map((faq) =>
          knowledgeBaseService.createFaq({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
          })
        )
      );
      return results;
    },
    onSuccess: (data) => {
      // Invalidate knowledge base queries to refresh the list
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all });
      toast.success(`Saved ${data.length} FAQ(s) to knowledge base!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save FAQs');
    },
  });
}

